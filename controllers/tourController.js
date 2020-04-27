const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async(req, res) => {
    try {
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
                tours,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.getTourById = async(req, res) => {
    try {
        const id = req.params.id;
        const tour = await Tour.findById(id);
        res.status(200).json({
            status: 'success',
            requetedAt: req.requetTime,
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.createTour = async(req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.updateTourById = async(req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;
        const tour = await Tour.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'successfully updated',
            requetedAt: req.requetTime,
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.deleteTourByID = async(req, res) => {
    try {
        const id = req.params.id;
        await Tour.findByIdAndDelete(id);
        res.status(204).json({
            status: 'successfully deleted',
            requetedAt: req.requetTime,
            data: {
                tour: null,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.getTourStats = async(req, res) => {
    try {
        const stats = await Tour.aggregate([{
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTour: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
            {
                $sort: { avgPrice: 1 },
            },
            {
                $match: { _id: { $ne: 'EASY' } },
            },
        ]);
        res.status(200).json({
            status: 'success',
            requetedAt: req.requetTime,
            data: {
                stats,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};

exports.getMothlyPlan = async(req, res) => {
    try {
        const year = req.params.year;
        const plan = await Tour.aggregate([{
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTour: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            {
                $sort: { numTour: -1 },
            },
            {
                $addFields: { month: '$_id' },
            },
            {
                $project: {
                    _id: 0,
                },
            },
            // {
            //     $limit: 3,
            // },
        ]);
        res.status(200).json({
            status: 'success',
            requetedAt: req.requetTime,
            results: plan.length,
            data: {
                plan,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'Fail',
            message: error,
        });
    }
};