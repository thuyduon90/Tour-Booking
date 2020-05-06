const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require(`${__dirname}/utils/AppError`);
const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const tourRouter = require(`${__dirname}/routes/tourRoute`);
const userRouter = require(`${__dirname}/routes/userRoute`);

const app = express();

/* GLOBAL MIDDLEWARES */

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json());
app.use((req, res, next) => {
    req.requetTime = new Date().toISOString();
    next();
});

/* ROUTES */
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/* HANDLE ERROR */
app.all('*', (req, res, next) => {
    next(
        new AppError(
            `Can't find ${req.originalUrl} on this server`,
            404
        )
    );
});

app.use(globalErrorHandler);

module.exports = app;