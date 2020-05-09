const Tour = require('../models/tourModel');

const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllTours = factory.getAll(Tour);
exports.getTourById = factory.getOne(Tour, {
    path: 'reviews',
    select: '-__v'
});
exports.createTour = factory.createOne(Tour);
exports.updateTourById = factory.updateOne(Tour);
exports.deleteTourByID = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getTourStats = catchAsync(
    async(req, res, next) => {
        const stats = await Tour.aggregate([{
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTour: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
            // {
            //     $match: { _id: { $ne: 'EASY' } },
            // },
        ]);
        res.status(200).json({
            status: 'success',
            requetedAt: req.requetTime,
            data: {
                stats
            }
        });
    }
);

exports.getMothlyPlan = catchAsync(
    async(req, res, next) => {
        const year = req.params.year;
        const plan = await Tour.aggregate([{
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTour: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $sort: { numTour: -1 }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            }
            // {
            //     $limit: 3,
            // },
        ]);
        res.status(200).json({
            status: 'success',
            requetedAt: req.requetTime,
            results: plan.length,
            data: {
                plan
            }
        });
    }
);