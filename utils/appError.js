class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = toString(statusCode).startsWith('4') ?
            'fail' :
            'error';
        this.isOpperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;