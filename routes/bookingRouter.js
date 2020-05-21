const express = require('express');
const bookingRouter = express.Router();

const bookingController = require('../controllers/bookingController');
const authController = require('./../controllers/authController');

bookingRouter.get(
    '/checkout-session/:tourID',
    authController.protect,
    bookingController.getCheckoutSession
);

module.exports = bookingRouter;