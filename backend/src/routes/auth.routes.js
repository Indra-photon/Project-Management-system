import {Router} from 'express'
import {forgotPasswordresetrequest, getMe, loginUser, logoutUser, 
  passwordReset, registerUser, resendverifyEmail, updateprofile, uploadUserAvatar, 
  refreshAccessToken, verifyEmail, generateApiKey} from '../controllers/auth.controllers.js'
import {validate} from '../middlewares/validator.middleware.js'
import {userRegistrationValidator, userLoginvalidator} from '../validators/index.js'
import { upload } from '../middlewares/multur.middlewares.js';
import { verifyJWT } from '../middlewares/verifyJWT.middlewares.js';

const router = Router()

router.route("/register").post(userRegistrationValidator(), validate, registerUser)
router.route("/login").post(userLoginvalidator(), validate, loginUser)
router.route("/verify-email").post(verifyEmail)
router.route("/refresh-access-token").post(verifyJWT, refreshAccessToken)
router.route("/resend-verify-email").post(resendverifyEmail)
router.route("/forgot-password-reset-email").post(forgotPasswordresetrequest)
router.route("/reset-password").post(passwordReset)
router.route("/get-me").post(verifyJWT, getMe)
router.route("/logout-user").post(verifyJWT,  logoutUser)
router.route("/update-profile").post(verifyJWT,  updateprofile)
router.route("/upload-avatar").patch(
    verifyJWT, 
    upload.single('avatar'),
    uploadUserAvatar
  )
router.route("/generate-api-key").post(verifyJWT, generateApiKey)

export default router