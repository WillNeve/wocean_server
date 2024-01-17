const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const { isUserAuthorized, isUserAuthenticated } = require('../controllers/auth');

router.get('/notes/new', isUserAuthenticated, notesController.create)

// -------- For Offline Testing ------------

// router.get('/user/:user_id/notes', (req, res) => {
//   res.status(200).json({notes: [{title: 'Test note', body: '[{"id": 0, "type": "p", "content": "test line"}]'},{title: 'Test note 2', body: '[{"id": 0, "type": "p", "content": "test line"}]'}]})
// })

// router.get('/notes/test', (req, res) => {
//   console.log('request for test note recieved');
//   res.status(200).json({message: 'test note for offline dev',
//                             note: {title: 'Test note', body: '[{"id": 0, "type": "p", "content": "test line"}]'}})
// })

// -----------

router.get('/user/:user_id/notes', isUserAuthorized, notesController.retrieveAll)

router.patch('/user/:user_id/notes', isUserAuthorized, notesController.saveAll)

router.get('/notes/:note_id', notesController.getUserIdFromNote, isUserAuthorized, notesController.retrieve)

router.patch('/notes/:note_id', notesController.getUserIdFromNote, isUserAuthorized, notesController.persist)


module.exports = {
  noteRoutes: router,
}
