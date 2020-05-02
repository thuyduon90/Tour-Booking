const fs = require('fs');

const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');

const catchAsync = require(`${__dirname}/../utils/catchAsync`);
// const appError = require(`${__dirname}/../utils/appError`);

const users = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../dev-data/data/users.json`
    )
);

exports.getAllUsers = catchAsync(async(req, res, next) => {
    const feature = new APIFeatures(User.find(), req.query);
    /* GENERATE QUERY */
    const query = feature
        .filterKeyword()
        .sort()
        .selectFields()
        .paginate().query;
    /* EXECUTE QUERY */
    const users = await query;

    res.status(200).json({
        status: 'success',
        result: users.length,
        requetedAt: req.requetTime,
        data: {
            users,
        },
    });
});

exports.getUserById = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;
    const user = users.find(el => el.id === id);
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
};

exports.createUser = (req, res) => {
    const newId = users[users.length - 1].id + 1;
    const newuser = Object.assign({ id: newId }, req.body);
    users.push(newuser);
    fs.writeFile(
        `${__dirname}/dev-data/data/users.json`,
        JSON.stringify(users),
        err => {
            res.status(201).json({
                status: 'success',
                data: {
                    user: newuser,
                },
            });
        }
    );
};

exports.updateUserById = (req, res) => {
    const id = req.params.id * 1;
    const user = users.find(el => el.id === id);
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: 'update user here...',
        },
    });
};

exports.deleteUserByID = (req, res) => {
    const id = req.params.id * 1;
    if (id > users.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
};