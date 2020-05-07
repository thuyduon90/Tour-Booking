const mongoose = require('mongoose');
// const slugify = require('slugify');
// const validator = require('validator');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must need content.'],
        trim: true,
        maxlength: [
            1000,
            'A review must be shorter 1000 characters',
        ],
    },
    rating: {
        type: Number,
        default: 1,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour.'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user.'],
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

/* QUERY MIDDLEWARE */
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'tour',
        select: 'name',
    }).populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;