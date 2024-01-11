const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');

router.get('/note/:id', notesController.retrieve)

router.patch('/note/:id', notesController.persist)

module.exports = {
  noteRoutes: router,
}
