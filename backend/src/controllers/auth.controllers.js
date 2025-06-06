import { ApiError } from "../utils/api-error.js";
import {ApiResponse} from '../utils/api-response.js'
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {mailgen,
    emailVerificationmailgenContent,
    forgotPasswordmailgenContent}  from '../utils/mail.js'

import crypto from 'crypto'
import { ApiKey } from "../models/apiKey.models.js"

const generateAccessAndRefereshTokens = async(userId) =>{
    console.log(userId)
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        let refreshTokenExpiry;
        refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        

        user.refreshToken = refreshToken
        user.refreshTokenExpiry = refreshTokenExpiry;
        await user.save({ validateBeforeSave: false })
        console.log({accessToken, refreshToken})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request, Please login again")
    }

    try {
        // Verify the refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        // Find the user with this refresh token
        const user = await User.findById(decodedToken?._id).select("-password")

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        // Check if the incoming refresh token matches the one in DB
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        // Generate new tokens
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

        // Set cookies
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }

        // Send response
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken},
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const registerUser =  asyncHandler(async(req, res) => {
    const {email, username, password, fullname} = req.body

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        // avatar: avatar?.url || "",
        username: username.toLowerCase(),
        email,
        fullname,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const { hashedToken, unhashedToken, tokenExpiry } = createdUser.generateTemporaryToken()
    createdUser.emailverificationToken = hashedToken
    createdUser.emailverificationTokenExpiry = tokenExpiry

    await createdUser.save({ validateBeforeSave: false })

    // send the email
    const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/?token=${unhashedToken}`
    const verificationemailgenContent = emailVerificationmailgenContent(createdUser.username, verificationUrl)
    await mailgen({
        email: createdUser.email,
        subject: "Verify your email",
        mailgenContent: verificationemailgenContent
    });


    return res.status(201).json(
        new ApiResponse(200, 
            createdUser, "User registered Successfully")
    )
    
})

const uploadUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path 
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: {
                    url: avatar.url,
                    localpath: avatarLocalPath || ""
                }
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const loginUser = asyncHandler(async (req, res) =>{

    const {email, password} = req.body

    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out successfully"))

})

const verifyEmail = asyncHandler(async(req,res) => {
    const {token} = req.query
    if (!token) {
        throw new ApiError(400, "Your token has expired. Request to verify your email again")
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = await User.findOne({
        emailverificationToken: hashedToken,
        emailverificationTokenExpiry: {$gt: Date.now()},
    })

    if(!user){
        throw new ApiError(400, "You are not registered yet. Please sign in")
    }

    user.isEmailVerified = true
    user.emailverificationToken = undefined;
    user.emailverificationTokenExpiry = undefined;

    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, "Email verified succesfully"))
})

const resendverifyEmail = asyncHandler(async(req,res) => {
    const {email} = req.body
    if(!email){
        throw new ApiError(400, "Email is required for verification")
    }

    const user = await User.findOne({email})
    if (!user) {
        throw new ApiError(400, "Account not found. Please verify your email or sign in again")
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Your email is already verified. Please log in")
    }

    const { hashedToken, unhashedToken, tokenExpiry } = user.generateTemporaryToken()
    user.emailverificationToken = hashedToken
    user.emailverificationTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    // send the email

    const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify-email/?token=${unhashedToken}`
    const verificationemailgenContent = emailVerificationmailgenContent(createdUser.username, verificationUrl)
    await mailgen({
        email: user.email,
        subject: "Verify your email",
        mailgenContent: verificationemailgenContent
      });

      return res
        .status(200)
        .json(new ApiResponse(201, 'Verification email sent successfully, check your registered email inbox'))
})

const forgotPasswordresetrequest = asyncHandler(async(req,res) => {
    const {email} = req.body

    const user = await User.findOne({email})
    if (!user) {
        throw new ApiError(409, "User with email does not exist. Please use the registered email or sign in again")
    }

    const {hashedToken, unhashedToken, tokenExpiry} = user.generateTemporaryToken()
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false });

    const forgotPasswordverificationUrl = `${process.env.FRONTEND_BASE_URL}/reset-your-password/?token=${unhashedToken}`
    const verificationemailgenContent = forgotPasswordmailgenContent(user.username, forgotPasswordverificationUrl)

    await mailgen({
        email: user.email,
        subject: "Reset Your Password",
        mailgenContent: verificationemailgenContent,
    });

    return res.status(201).json(
        new ApiResponse(200, "Verification Email sent successfully")
    )
})

const passwordReset = asyncHandler(async(req,res) => {
    const {password} = req.body
    const {token} = req.params

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: {$gt: Date.now()},
    })
    if (!user) {
        throw new ApiError(409, "Token Invalid. Please try again")
    }

    user.password = password
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return res.status(201).json(
        new ApiResponse(200, "Password reset successfully")
    )
})

const getMe = asyncHandler(async(req,res) => {

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateprofile = asyncHandler(async(req, res) => {
    const userId = req.user._id;
    const { username, fullname, email } = req.body;
  
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new ApiError(409, "Username is already taken");
      }
      user.username = username;
    }
  
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new ApiError(409, "email is already taken");
      }
      user.email = email;
    }
  
    if (fullname) {
        user.fullname = fullname
    }
  
    await user.save({ validateBeforeSave: false });
  
    const updatedUser = await User.findById(userId).select(
      "-password -refreshToken",
    );
  
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
})

const generateApiKey = asyncHandler(async (req, res) => {
    const { name } = req.body
    const userId = req.user._id
    
    if (!name) {
        throw new ApiError(400, "API key name is required")
    }
    
    const existingKeys = await ApiKey.countDocuments({ 
        user: userId, 
        isActive: true 
    })
    
    if (existingKeys >= 5) {
        throw new ApiError(400, "Maximum API key limit reached (5)")
    }
    
    const apiKeyDoc = new ApiKey({
        user: userId,
        name: name.trim()
    })
    
    const apiKey = apiKeyDoc.generateApiKey()
    await apiKeyDoc.save()
    
    return res.status(201).json(
        new ApiResponse(201, {
            // api_key: apiKey,
            name: apiKeyDoc.name,
            created_at: apiKeyDoc.createdAt
        }, "API key generated successfully")
    )
})






export {
    registerUser,
    uploadUserAvatar,
    refreshAccessToken,
    loginUser,
    verifyEmail,
    resendverifyEmail,
    forgotPasswordresetrequest,
    passwordReset,
    getMe,
    logoutUser,
    updateprofile,
    generateApiKey
}