const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

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

exports.getLoginForm = catchAsync(async(req, res) => {
    res.status(200).render('login', {
        title: 'Login'
    });
});