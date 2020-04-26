const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async(req, res) => {
    try {
        let queryObj = {...req.query };
        const excludedField = [
            'page',
            'sort',
            'limit',
            'fields',
        ];
        excludedField.forEach(
            el => delete queryObj[el]
        );
        queryObj = JSON.parse(
            JSON.stringify(queryObj).replace(
                /\b(gte|gt|lt|lte)\b/g,
                match => `$${match}`
            )
        );
        /* GENERATE QUERY */
        const query = Tour.find(queryObj);
        /* Sort */
        if (req.query.sort) {
            const sortBy = req.query.sort
                .split(',')
                .join(' ');
            query.sort(sortBy);
        } else {
            query.sort('-createdAT');
        }
        /* Select Field */
        if (req.query.fields) {
            const fields = req.query.fields
                .split(',')
                .join(' ');
            query.select(fields);
        } else {
            query.select('-__v');
        }
        /* Pagination */
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;
        query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTour = await Tour.countDocuments();
            if (skip >= numTour) {
                throw new Error(
                    'This page does not exist.'
                );
            }
        }

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
        const tour = await Tour.findByIdAndUpdate(
            id,
            body, {
                new: true,
                runValidators: true,
            }
        );
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
//