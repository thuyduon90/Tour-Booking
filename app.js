const express = require('express');
const morgan = require('morgan');

const tourRouter = require(`${__dirname}/routes/tourRoute`);
const userRouter = require(`${__dirname}/routes/userRoute`);

const app = express();

/* MIDDLEWARES */

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use((req, res, next) => {
    req.requetTime = new Date().toISOString();
    next();
});

/* ROUTES */
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;