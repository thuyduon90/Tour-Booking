const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');

userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

userRouter
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUserById)
    .delete(userController.deleteUserByID);

module.exports = userRouter;