const appError = require(`${__dirname}/../utils/appError`);

const handleCastErrorDB = error => {
    return new appError(`invalid ${error.path}, please double check your ${error.path}!`, 400);
};

const handleDuplicateFieldsDB = error => {
    const message = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    return new appError(`Duplicate field value: ${message}. Please use another value!`, 400);
};

const handleValidationErrorDB = error => {
    let errors = Object.values(error.errors).map(val => val.message);
    return new appError(`In valid data. ${errors.join(', ')}`, 400);
};

const handleJsonWebTokenError = () => {
    return new appError(`Invalid token, please log in again!`, 401);
};

const handleTokenExpiredError = () => {
    return new appError(`Your token expired! please log in again to get a new token`, 401);
};

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    console.error('ERROR 👹: ', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOpperational) {
            // Operational, trusted errors will be sent using this code
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        //some programing or unknown errors will be sent using this code
        console.error('ERROR 👹: ', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
    if (err.isOpperational) {
        // Operational, trusted errors will be sent using this code
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    //some programing or unknown errors will be sent using this code
    console.error('ERROR 👹: ', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again!'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        console.log(err);
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') {
            let error = {...err };
            error = handleCastErrorDB(error);
            return sendErrorProd(error, req, res);
        }
        if (err.code === 11000) {
            let error = {...err };
            error = handleDuplicateFieldsDB(error);
            return sendErrorProd(error, req, res);
        }
        if (err.name === 'ValidationError') {
            let error = {...err };
            error = handleValidationErrorDB(error);
            return sendErrorProd(error, req, res);
        }
        if (err.name === 'JsonWebTokenError') {
            let error = {...err };
            error = handleJsonWebTokenError();
            return sendErrorProd(error, req, res);
        }
        if (err.name === 'TokenExpiredError') {
            let error = {...err };
            error = handleTokenExpiredError();
            return sendErrorProd(error, req, res);
        }
        sendErrorProd(err, req, res);
    }
};