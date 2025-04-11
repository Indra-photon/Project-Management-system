import {body} from 'express-validator'

const userRegistrationValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body('username')
            .trim()
            .notEmpty().withMessage("username is required")
            .isLength({min: 3}).withMessage("Minimum 3 characters is required")
            .isLength({max: 13}).withMessage("Maximum 13 characters allowed")
    ]
}

const userLoginvalidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is not valid"),
        
        body('password')
            .notEmpty().withMessage("Password is required")
    ]
}

export {
    userRegistrationValidator,
    userLoginvalidator
}