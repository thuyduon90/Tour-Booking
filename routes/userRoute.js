const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post(
    '/forgotpassword',
    authController.forgotPassword
);
userRouter.patch(
    '/resetpassword/:token',
    authController.resetPassword
);

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