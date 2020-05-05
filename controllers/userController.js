const fs = require('fs');

const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const appError = require(`${__dirname}/../utils/appError`);

const users = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../dev-data/data/users.json`
    )
);

const filterObj = (obj, ...allowedFileds) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFileds.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async(req, res, next) => {
    const feature = new APIFeatures(User.find(), req.query);
    /* GENERATE QUERY */
    const query = feature
        .filterKeyword()
        .sort()
        .selectFields()
        .paginate().query;
    /* EXECUTE QUERY */
    const users = await query;

    res.status(200).json({
        status: 'success',
        result: users.length,
        requetedAt: req.requetTime,
        data: {
            users,
        },
    });
});

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
            user: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        active: false,
    });

    res.status(204).json({
        status: 'Success',
        data: null,
    });
});

/* ==================================
=====================================
===================================== */
exports.getUserById = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;
    const user = users.find(el => el.id === id);
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
};

exports.createUser = (req, res) => {
    const newId = users[users.length - 1].id + 1;
    const newuser = Object.assign({ id: newId }, req.body);
    users.push(newuser);
    fs.writeFile(
        `${__dirname}/dev-data/data/users.json`,
        JSON.stringify(users),
        err => {
            res.status(201).json({
                status: 'success',
                data: {
                    user: newuser,
                },
            });
        }
    );
};

exports.updateUserById = (req, res) => {
    const id = req.params.id * 1;
    const user = users.find(el => el.id === id);
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: 'update user here...',
        },
    });
};

exports.deleteUserByID = (req, res) => {
    const id = req.params.id * 1;
    if (id > users.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
};