const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

reviewRouter.use(authController.protect);

reviewRouter
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

reviewRouter
    .route('/:id')
    .get(reviewController.getReviewById)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReviewById)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReviewById);

module.exports = reviewRouter;