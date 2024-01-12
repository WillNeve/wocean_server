const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const { isUserAuthorized } = require('../controllers/auth');

router.get('/note/:id', isUserAuthorized, notesController.retrieve)

router.get('/user/:id/notes', isUserAuthorized, notesController.retrieveAll)

router.patch('/note/:id', isUserAuthorized, notesController.persist)

module.exports = {
  noteRoutes: router,
}
