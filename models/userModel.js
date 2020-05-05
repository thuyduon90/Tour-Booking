const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user needs a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email must be required'],
        unique: [true, 'Email must be unique'],
        trim: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Please provide a valid email',
        ],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Password must be required'],
        minlength: [
            8,
            'password must be longer than 8 characters',
        ],
        maxlength: [
            40,
            'password must be shorter than 40 characters',
        ],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password need to be confirmed'],
        validate: {
            // this only work on CREATE or SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Not a simmilar password!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

/* MIDDLEWARE */
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    if (this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

/* INSTANCE METHOD */

userSchema.methods.correctPassword = async function(
    candidatePasswod,
    userPassword
) {
    return await bcrypt.compare(
        candidatePasswod,
        userPassword
    );
};

userSchema.methods.changePasswordAfter = function(
    JWTTimestampIssued
) {
    if (this.passwordChangedAt) {
        const changedTimestamp =
            (this.passwordChangedAt.getTime() * 1) / 1000;
        return JWTTimestampIssued < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;