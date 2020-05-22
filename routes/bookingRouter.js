const express = require('express');
const bookingRouter = express.Router();

const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

bookingRouter.use(authController.protect);

bookingRouter.get('/checkout-session/:tourID', bookingController.getCheckoutSession);

bookingRouter
    .route('/')
    .get(authController.restrictTo('admin', 'lead-guide'), bookingController.getAllBookings)
    .post(authController.restrictTo('admin'), bookingController.createBooking);

bookingRouter
    .route('/:id')
    .get(authController.restrictTo('admin', 'lead-guide'), bookingController.getBookingById)
    .patch(authController.restrictTo('admin'), bookingController.updateBookingById)
    .delete(authController.restrictTo('admin'), bookingController.deleteBookingByID);

module.exports = bookingRouter;