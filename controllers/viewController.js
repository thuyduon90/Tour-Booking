const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async(req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async(req, res) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        field: 'reviews rating user'
    });
    //console.log(tourName);

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