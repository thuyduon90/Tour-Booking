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
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
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
        console.log(changedTimestamp, JWTTimestampIssued);
        return JWTTimestampIssued < changedTimestamp;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;