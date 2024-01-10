const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

router.post('/register', usersController.register);

router.post('/signin', usersController.authorize);

module.exports = {
  userRoutes: router,
}
