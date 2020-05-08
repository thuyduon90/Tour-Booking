const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

exports.deleteOne = Model =>
    catchAsync(async(req, res, next) => {
        const id = req.params.id;
        const doc = await Model.findByIdAndDelete(id);
        if (!doc) {
            return next(
                new appError(
                    'There is no any document with that ID',
                    404
                )
            );
        }
        res.status(204).json({
            status: 'successfully deleted',
            requetedAt: req.requetTime,
            data: null
        });
    });

exports.updateOne = Model =>
    catchAsync(async(req, res, next) => {
        const id = req.params.id;
        const body = req.body;
        const doc = await Model.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });
        if (doc === null) {
            return next(
                new appError(
                    'There is no any document with that ID',
                    404
                )
            );
        }
        res.status(200).json({
            status: 'successfully updated',
            requetedAt: req.requetTime,
            data: {
                data: doc
            }
        });
    });

exports.createOne = Model =>
    catchAsync(async(req, res, next) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: newDoc
            }
        });
    });