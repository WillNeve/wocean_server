const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const { isUserAuthorized, isUserAuthenticated } = require('../controllers/auth');

router.get('/notes/new', isUserAuthenticated, notesController.create)

router.get('/user/:user_id/notes', isUserAuthorized, notesController.retrieveAll)

router.patch('/user/:user_id/notes', isUserAuthorized, notesController.saveAll)

router.delete('/user/:user_id/notes', isUserAuthorized, notesController.deleteSome)

router.get('/notes/:note_id', notesController.getUserIdFromNote, isUserAuthorized, notesController.retrieve)

router.patch('/notes/:note_id', notesController.getUserIdFromNote, isUserAuthorized, notesController.persist)


module.exports = {
  noteRoutes: router,
}
