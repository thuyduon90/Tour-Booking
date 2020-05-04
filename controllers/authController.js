const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require(`./../utils/catchAsync`);
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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
        role: req.body.role,
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

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(
                new appError(
                    'This user do not have pemission to perform this action',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(
    async(req, res, next) => {
        // 1) get user based on POSTed email
        const user = await User.findOne({
            email: req.body.email,
        });
        if (!user) {
            next(
                new appError(
                    'There is no any user with this email address!',
                    404
                )
            );
        }

        // 2) generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        // 3) send the token to user's email
        const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH resquest 
        with your new password and passwordConfirm to: ${resetURL}.\n
        If you didn't forget your password, please ignorge this email!`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                message,
            });
            res.status(200).json({
                status: 'Success',
                message: 'Token sent to your email',
            });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(
                new appError(
                    'There is an error sending the email. Try again later!',
                    500
                )
            );
        }
    }
);

exports.resetPassword = catchAsync(
    async(req, res, next) => {
        // 1) Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        console.log('here: ' + req.params.token);
        console.log('here: ' + hashedToken);
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        // 2) If token has not expired, there is  user, set the new password
        if (!user) {
            return next(
                new appError('Token is invalid or has expired', 400)
            );
        }
        // 3) Update changedPasswordAt for the current user
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        // 4) Log the user in, send JWT
        const token = signToken(user._id);
        res.status(200).json({
            status: 'success',
            token,
        });
    }
);