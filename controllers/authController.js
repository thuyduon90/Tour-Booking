const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require(`./../utils/catchAsync`);
const appError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new appError('Please provide email and password', 400)
        );
    }
    const user = await User.findOne({ email }).select(
        'password'
    );
    if (!user ||
        !(await user.correctPassword(password, user.password))
    ) {
        return next(
            new appError('Incorrect email or password', 401)
        );
    }

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async(req, res, next) => {
    // 1) get token an check availability
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new appError(
                'You are not logged in! please login to get access.',
                401
            )
        );
    }
    // 2) Veificate token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
    );

    //3) checkif user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new appError('This user is no longer exist', 401)
        );
    }

    //4) check if users change password after token issue
    if (freshUser.changePasswordAfter(decoded.iat)) {
        return next(
            new appError(
                'Password have been recently changed! Please login again.',
                401
            )
        );
    }
    // Grant access to protected routes
    req.user = freshUser;
    next();
});