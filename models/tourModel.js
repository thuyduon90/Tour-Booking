const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name.'],
        unique: true,
        trim: true,
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must contain a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty.'],
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.'],
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description.'],
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image.'],
    },
    images: [String],
    createdAT: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    startDates: [Date],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

/* VIRTUAL PROPERTY */
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

/* DOCUMENT MIDLEWARE: run before save() or create() not InsertMany(), find(), update()*/
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

/* tourSchema.post('save', function(doc, next) {
    console.log(doc);
    next();
}); */

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;