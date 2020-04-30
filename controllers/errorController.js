const appError = require(`${__dirname}/../utils/appError`);

const handleCastErrorDB = error => {
    return new appError(`invalid ${error.path}`, 400);
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
        // console.log(err);

        //convert CastError of Database  to Opperational error
        if (err.name === 'CastError') {
            let error = {...err };
            error = handleCastErrorDB(error);
            sendErrorProd(error, res);
        } else {
            sendErrorProd(err, res);
        }
    }
};