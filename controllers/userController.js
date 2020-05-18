const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

//Storage image to buffer for sharp
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

/* ==================================
=====================================
===================================== */

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

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async(req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordCofirm) {
        return next(
            new appError('This route is not for password update. Please use /updatepassword', 400)
        );
    }
    // 2) Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
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
        status: 'success',
        data: null
    });
});