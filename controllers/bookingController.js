const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    // 1) Get the current tour
    const tour = await Tour.findById(req.params.tourID);
    if (!tour) {
        return next(new appError('This tour is not longer exist.', 404));
    }
    // 2) Create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //     success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${
        //   req.user.id
        // }&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

// exports.createBookingCheckout = catchAsync(async(req, res, next) => {
//     const { tour, user, price } = req.query;

//     if (!tour && !user && !price) {
//         return next();
//     }
//     await Booking.create({ tour, user, price });
//     res.redirect(req.originalUrl.split('?')[0]);
//     next();
// });

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRETE);
    } catch (error) {
        return res.status(400).send(`Webhook error: ${error.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object);
        res.status(200).json({
            received: true
        });
    }
};

exports.isBooked = catchAsync(async(req, res, next) => {
    // 1) get user id and tour id
    if (!req.user) return next();
    const user = req.user.id;
    const tour = (await Tour.findOne({ slug: req.params.slug })).id;
    const bookings = await Booking.find({ user });
    console.log(bookings);

    if (bookings.length === 0) return next();
    bookings.forEach(el => {
        console.log(el.tour.id);

        if (el.tour.id === tour) {
            return (res.locals.isBooked = true);
        }
    });

    next();

    // 2)check in database

    //
});

exports.getBookingById = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBookingById = factory.updateOne(Booking);
exports.deleteBookingByID = factory.deleteOne(Booking);