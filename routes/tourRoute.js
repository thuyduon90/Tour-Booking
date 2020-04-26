const express = require('express');
const tourRouter = express.Router();

const tourController = require('../controllers/tourController');

// tourRouter.param('id', tourController.checkId);

tourRouter
    .route('/top-5-cheap')
    .get(
        tourController.aliasTopTours,
        tourController.getAllTours
    );

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

tourRouter
    .route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTourById)
    .delete(tourController.deleteTourByID);

module.exports = tourRouter;