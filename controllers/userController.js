const User = require('../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllUsers = factory.getAll(User);
exports.getUserById = factory.getOne(User);
// Do not update password with this
exports.updateUserById = factory.updateOne(User);
exports.deleteUserByID = factory.deleteOne(User);

/* ==================================
=====================================
===================================== */

const filterObj = (obj, ...allowedFileds) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFileds.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async(req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordCofirm) {
        return next(
            new appError(
                'This route is not for password update. Please use /updatepassword',
                400
            )
        );
    }
    // 2) Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        filteredBody, { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'Success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        active: false
    });

    res.status(204).json({
        status: 'Success',
        data: null
    });
});