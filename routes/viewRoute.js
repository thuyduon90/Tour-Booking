const express = require('express');
const viewRouter = express.Router();
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const viewController = require('../controllers/viewController');

viewRouter.use(viewController.alerts);

viewRouter.get('/me', authController.protect, viewController.getAccount);
viewRouter.get('/my-tours', authController.protect, viewController.getMyTour);
viewRouter.post('/submit-user-data', authController.protect, viewController.updateUserData);

viewRouter.get(
    '/',
    // bookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview
);
viewRouter.get(
    '/tour/:slug',
    authController.isLoggedIn,
    bookingController.isBooked,
    viewController.getTour
);
viewRouter.get('/login', authController.isLoggedIn, viewController.getLoginForm);
viewRouter.get('/signup', authController.isLoggedIn, viewController.getSignupForm);

module.exports = viewRouter;