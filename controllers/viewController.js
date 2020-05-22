const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const filterObj = (obj, ...allowedFileds) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFileds.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getOverview = catchAsync(async(req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async(req, res, next) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        field: 'reviews rating user'
    });

    if (!tour) {
        return next(new appError('There is no any tour with that name.', 404));
    }

    res.status(200).render('tour', {
        title: tour.name + 'Tour',
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Signup'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: req.user.name,
        user: req.user
    });
};

exports.getMyTour = catchAsync(async(req, res) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    res.status(200).render('overview', {
        title: 'My Booked Tours',
        tours
    });
});

exports.updateUserData = catchAsync(async(req, res, next) => {
    // 2) Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).render('account', {
        title: updatedUser.name,
        user: updatedUser
    });
});