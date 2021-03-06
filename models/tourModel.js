const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name.'],
        unique: true,
        trim: true,
        maxlength: [
            40,
            'The tour name must have less or equal than 40 characters'
        ],
        minlength: [
                10,
                'The tour name must have more or equal than 10 characters'
            ]
            // validate: [
            //     validator.isAlpha,
            //     'Tour name must only characters',
            // ],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must contain a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size.']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty.'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must either: easy, medium, difficult'
        } // This validator is only used for string
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'], //This validator is used for number and date
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                // this only for create method, not for update
                return val < this.price;
            },
            message: 'The discount value ({VALUE}) must be less than the origin price'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description.']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image.']
    },
    images: [String],
    createdAT: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/* SET INDEX */
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

/* VIRTUAL PROPERTY */
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

/* VIRTUAL POPULATE */
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

/* DOCUMENT MIDLEWARE: run before save() or create() not InsertMany(), find(), update()*/
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

/* tourSchema.pre('save', async function(next) {
    const guidesPromises = this.guides.map(
        async id => await User.findById(id)
    );
    this.guides = await Promise.all(guidesPromises);
    next();
}); */

/* tourSchema.post('save', function(doc, next) {
    console.log(doc);
    next();
}); */

/* QUERY MIDDLEWARE: run after each query */
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(
        `Query Took: ${Date.now() - this.start} millisecond`
    );
    next();
});

/* AGGREGATION MIDDLEWARE */
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({
//         $match: { secretTour: { $ne: true } }
//     });

//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;