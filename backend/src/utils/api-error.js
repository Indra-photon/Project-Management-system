class ApiError extends Error {
    // constructor (
    //     statusCode,
    //     message = "Something went wrong",
    //     stack = " "
    // ) {
    //     super(message)
    //     this.statusCode = statusCode,
    //     this.message = message
    //     this.success = false
    //     this.errors = errors

    //     if (stack) {
    //         this.stack = stack
    //     } else {
    //         Error.captureStackTrace(this, this.constructor)
    //     }
    // }
    constructor (
        statusCode,
        message = "Something went wrong",
        errors = [],  // Add this parameter with a default empty array
        stack = " "
    ) {
        super(message)
        this.statusCode = statusCode,
        this.message = message
        this.success = false
        this.errors = errors
    
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}



export {ApiError}