const express = require('express');
const viewRouter = express.Router();
const authController = require('./../controllers/authController');

const viewController = require('./../controllers/viewController');

viewRouter.use(authController.isLoggedIn);

viewRouter.get('/', viewController.getOverview);
viewRouter.get('/tour/:slug', viewController.getTour);
viewRouter.get('/login', viewController.getLoginForm);

module.exports = viewRouter;