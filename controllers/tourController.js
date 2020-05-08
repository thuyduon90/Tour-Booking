const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const appError = require(`${__dirname}/../utils/appError`);

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = catchAsync(async(req, res, next) => {
    const feature = new APIFeatures(Tour.find(), req.query);
    /* GENERATE QUERY */
    const query = feature
        .filterKeyword()
        .sort()
        .selectFields()
        .paginate().query;
    /* EXECUTE QUERY */
    const tours = await query;

    res.status(200).json({
        status: 'success',
        result: tours.length,
        requetedAt: req.requetTime,
        data: {
            tours
        }
    });
});

exports.getTourById = catchAsync(async(req, res, next) => {
    const id = req.params.id;
    const tour = await Tour.findById(id).populate({
        path: 'reviews',
        select: '-__v'
    });

    if (tour === null) {
        return next(
            new appError('There is no any tour with that ID', 404)
        );
    }
    res.status(200).json({
        status: 'success',
        requetedAt: req.requetTime,
        data: {
            tour
        }
    });
});

exports.createTour = catchAsync(async(req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

exports.updateTourById = catchAsync(
    async(req, res, next) => {
        const id = req.params.id;
        const body = req.body;
        const tour = await Tour.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });
        if (tour === null) {
            return next(
                new appError(
                    'There is no any tour with that ID',
                    404
                )
            );
        }
        res.status(200).json({
            status: 'successfully updated',
            requetedAt: req.requetTime,
            data: {
                tour
            }
        });
    }
);

exports.deleteTourByID = catchAsync(
    async(req, res, next) => {
        const id = req.params.id;
        const tour = await Tour.findByIdAndDelete(id);
        if (!tour) {
            return next(
                new appError(
                    'There is no any tour with that ID',
                    404
                )
            );
        }
        res.status(204).json({
            status: 'successfully deleted',
            requetedAt: req.requetTime,
            data: {
                tour: null
            }
        });
    }
);

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