const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(
    async(req, res, next) => {
        let filter = {};
        if (req.params.tourId)
            filter = { tour: req.params.tourId };
        const feature = new APIFeatures(
            Review.find(filter),
            req.query
        );
        /* GENERATE QUERY */
        const query = feature
            .filterKeyword()
            .sort()
            .selectFields()
            .paginate().query;
        /* EXECUTE QUERY */
        const review = await query;

        res.status(200).json({
            status: 'success',
            result: review.length,
            requetedAt: req.requetTime,
            data: {
                review
            }
        });
    }
);

exports.getReviewById = catchAsync(
    async(req, res, next) => {
        const id = req.params.id;
        const review = await Review.findById(id);
        if (review === null) {
            return next(
                new appError(
                    'There is no any review with that ID',
                    404
                )
            );
        }
        res.status(200).json({
            status: 'success',
            requetedAt: req.requetTime,
            data: {
                review
            }
        });
    }
);

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.createReview = factory.createOne(Review);
exports.updateReviewById = factory.updateOne(Review);
exports.deleteReviewById = factory.deleteOne(Review);