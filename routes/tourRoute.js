const express = require('express');
const tourRouter = express.Router();

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRoute = require('../routes/reviewRoute');

tourRouter.use('/:tourId/reviews', reviewRoute);

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
    .route('/tour-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMothlyPlan
    );

tourRouter.route('/distances/:latlong/unit/:unit').get(tourController.getDistances);

tourRouter
    .route('/tours-within/:distance/center/:latlong/unit/:unit')
    .get(tourController.getTourWithin);

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour
    );

tourRouter
    .route('/:id')
    .get(tourController.getTourById)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTourById
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTourByID
    );

module.exports = tourRouter;