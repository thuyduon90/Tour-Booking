const express = require('express');
const userRouter = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

/* UNPROTECTED ROUTE */
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

/* PROTECTED ROUTE */
userRouter.use(authController.protect);
userRouter.patch(
    '/updatepassword/',
    authController.updatePassword
);
userRouter.get(
    '/me',
    userController.getMe,
    userController.getUserById
);
userRouter.patch('/updateme/', userController.updateMe);
userRouter.delete('/deleteme/', userController.deleteMe);

/* ONLY ADMIN CAN ACCECSS THESE ROUTES */
userRouter.use(authController.restrictTo('admin'));
userRouter.route('/').get(userController.getAllUsers);
userRouter
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUserById)
    .delete(userController.deleteUserByID);

module.exports = userRouter;