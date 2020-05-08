const express = require('express');
const tourRouter = express.Router();

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRoute = require('./../routes/reviewRoute');

tourRouter.use('/:tourId/reviews', reviewRoute);

tourRouter
    .route('/top-5-cheap')
    .get(
        tourController.aliasTopTours,
        tourController.getAllTours
    );

tourRouter
    .route('/tour-stats')
    .get(tourController.getTourStats);

tourRouter
    .route('/tour-plan/:year')
    .get(tourController.getMothlyPlan);

tourRouter
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

tourRouter
    .route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTourById)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTourByID
    );

module.exports = tourRouter;