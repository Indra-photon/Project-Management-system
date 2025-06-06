import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { verifyJWT } from "./verifyJWT.middlewares.js"
import { verifyAPI } from "./verifyAPI.middlewares.js"

export const verify = asyncHandler(async (req, res, next) => {
   try {
       const apiKey = req.headers['x-api-key']
       const jwtToken = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken
       
       if (!jwtToken) {
           throw new ApiError(401, "JWT token is required")
       }
       
       if (!apiKey) {
           throw new ApiError(401, "API key is required")
       }
       
       await verifyJWT(req, {}, () => {})
       const jwtUser = req.user
       
       await verifyAPI(req, {}, () => {})
       const apiKeyUser = req.user
       
       if (jwtUser._id.toString() !== apiKeyUser._id.toString()) {
           throw new ApiError(401, "JWT and API key belong to different users")
       }
       
       next()
   } catch (error) {
       throw new ApiError(401, error?.message || "Authentication failed")
   }
})