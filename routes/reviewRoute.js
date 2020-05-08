const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

reviewRouter
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    );

reviewRouter
    .route('/:id')
    .get(reviewController.getReviewById);

module.exports = reviewRouter;