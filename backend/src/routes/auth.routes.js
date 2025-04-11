import {Router} from 'express'
import { verifyJWT } from '../middlewares/verifyJWT.middlewares.js'
import {forgotPasswordresetrequest, getMe, loginUser, logoutUser, 
  passwordReset, registerUser, resendverifyEmail, updateprofile, uploadUserAvatar, 
  verifyEmail} from '../controllers/auth.controllers.js'
import {validate} from '../middlewares/validator.middleware.js'
import {userRegistrationValidator, userLoginvalidator} from '../validators/index.js'
import { upload } from '../middlewares/multur.middlewares.js';

const router = Router()

router.route("/register").post(userRegistrationValidator(), validate, registerUser)
router.route("/login").post(userLoginvalidator(), validate, loginUser)
router.route("/verify-email").post(verifyEmail)
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

export default router