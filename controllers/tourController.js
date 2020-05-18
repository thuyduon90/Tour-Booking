const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new appError('Not an image! Please upload only image.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([{
        name: 'imageCover',
        maxCount: 1
    },
    {
        name: 'images',
        maxCount: 3
    }
]);

// upload.array('images', 5); // req.file
// upload.single('image'); //req.files

exports.resizeTourImages = catchAsync(async(req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    // 2) Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async(file, index) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename);
        })
    );
    next();
});

exports.getTourById = factory.getOne(Tour, {
    path: 'reviews',
    select: '-__v'
});
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTourById = factory.updateOne(Tour);
exports.deleteTourByID = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getTourStats = catchAsync(async(req, res, next) => {
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
});

exports.getMothlyPlan = catchAsync(async(req, res, next) => {
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
});

exports.getTourWithin = catchAsync(async(req, res, next) => {
    const { distance, latlong, unit } = req.params;
    const [lat, long] = latlong.split(',');

    if (!lat || !long) {
        return next(
            new appError('Please provide lattitute and longitude in the format <lat,long>.'),
            400
        );
    }

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [long, lat], radius
                ]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async(req, res, next) => {
    const { latlong, unit } = req.params;
    const [lat, long] = latlong.split(',');

    if (!lat || !long) {
        return next(
            new appError('Please provide lattitute and longitude in the format <lat,long>.'),
            400
        );
    }

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const distances = await Tour.aggregate([{
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [long * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});

// '/distances/:latlong/unit/:unit'