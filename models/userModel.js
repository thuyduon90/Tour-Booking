const mongoose = require('mongoose');
const validator = require('validator');

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
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password need to be confirmed'],
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;