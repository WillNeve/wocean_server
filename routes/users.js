const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { isUserAuthorized, isUserAuthenticated } = require('../controllers/auth');

router.get('/user/:user_id/stats', isUserAuthorized, usersController.getStats)

router.post('/register', usersController.register);

router.post('/signin', usersController.authenticate);

module.exports = {
  userRoutes: router,
}
