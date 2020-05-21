const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);

const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    // 1) Get the current tour
    const tour = await Tour.findById(req.params.tourID);
    if (!tour) {
        return next(new appError('This tour is not longer exist.', 404));
    }
    // 2) Create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    });
    // 3) Create a session as response
    res.status(200).json({
        status: 'success',
        session
    });
    next();
});