const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require(`../utils/catchAsync`);
const appError = require('../utils/appError');
const Email = require('../utils/email');

/* **************LOCAL FUNCTIONS************************
 ********************************************************
 ********************************************************/

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {
    /* Create token */
    const token = signToken(user._id);
    /* Set cookie options */
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 3600 * 24),
        httpOnly: true,
        secure = req.secure || req.headers('x-forwarded-poto') === 'https'
    };
    /* Send cookie to client */
    res.cookie('jwt', token, cookieOptions);
    /* Ignore some sensitive fiels before send to client*/
    user.password = undefined;
    user.__v = undefined;
    /* Send data back to client */
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

const moveNextWithError = (errorMessage, statusCode, next) => {
    return next(new appError(errorMessage, statusCode));
};

/* **************EXPORTED FUNCTIONS*********************
 ********************************************************
 ********************************************************/

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
            // role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return moveNextWithError('Please provide email and password', 400, next);
    }

    const user = await User.findOne({ email }).select('password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return moveNextWithError('Incorrect email or password', 401, next);
    }

    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

exports.protect = catchAsync(async(req, res, next) => {
    // 1) get token an check availability
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return moveNextWithError('You are not logged in! please login to get access.', 401, next);
    }
    // 2) Veificate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) checkif user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return moveNextWithError('This user is no longer exist', 401, next);
    }

    //4) check if users change password after token issue
    if (freshUser.changePasswordAfter(decoded.iat)) {
        return moveNextWithError('Password have been recently changed! Please login again.', 401, next);
    }
    // Grant access to protected routes
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
});

// Only for rendered page, no error
exports.isLoggedIn = async(req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }

            //4) check if users change password after token issue
            if (freshUser.changePasswordAfter(decoded.iat)) {
                return next();
            }
            // There is a logged in user
            res.locals.user = freshUser;
            return next();
        } catch (error) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return moveNextWithError('This user do not have pemission to perform this action', 403, next);
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) get user based on POSTed email
    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) {
        return moveNextWithError('There is no any user with this email address!', 404, next);
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) send the token to user's email
    try {
        const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'Success',
            message: 'Token sent to your email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return moveNextWithError('There is an error sending the email. Try again later!', 500, next);
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2) If token has not expired, there is  user, set the new password
    if (!user) {
        return moveNextWithError('Token is invalid or has expired', 400, next);
    }
    // 3) Update changedPasswordAt for the current user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('password');
    // 2) Check Posted password is correct
    const { password, newPassword, passwordConfirm } = req.body;
    if (!(await user.correctPassword(password, user.password))) {
        return moveNextWithError('Your current password is incorrect!', 401, next);
    }
    // 3) If ok, update password
    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
});