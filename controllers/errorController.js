const appError = require(`${__dirname}/../utils/appError`);

const handleCastErrorDB = error => {
    return new appError(
        `invalid ${error.path}, please double check your ${error.path}!`,
        400
    );
};

const handleDuplicateFieldsDB = error => {
    const message = error.errmsg.match(
        /(["'])(?:(?=(\\?))\2.)*?\1/
    )[0];
    return new appError(
        `Duplicate field value: ${message}. Please use another value!`,
        400
    );
};

const handleValidationErrorDB = error => {
    let errors = Object.values(error.errors).map(
        val => val.message
    );
    return new appError(
        `In valid data. ${errors.join(', ')}`,
        400
    );
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOpperational) {
        // Operational, trusted errors will be sent using this code
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        //some programing or unknown errors will be sent using this code
        console.error('ERROR 👹: ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        console.log(err);
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') {
            let error = {...err };
            error = handleCastErrorDB(error);
            return sendErrorProd(error, res);
        }
        if (err.code === 11000) {
            let error = {...err };
            error = handleDuplicateFieldsDB(error);
            return sendErrorProd(error, res);
        }
        if (err.name === 'ValidationError') {
            let error = {...err };
            error = handleValidationErrorDB(error);
            return sendErrorProd(error, res);
        }
        sendErrorProd(err, res);
    }
};