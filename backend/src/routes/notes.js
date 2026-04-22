const express = require('express');

const { authRequired } = require('../middleware/auth');
const {
  createNote,
  getMyNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../controllers/notesController');

const router = express.Router();

router.use(authRequired);

router.post('/', (req, res, next) => {
  Promise.resolve(createNote(req, res)).catch(next);
});

router.get('/', (req, res, next) => {
  Promise.resolve(getMyNotes(req, res)).catch(next);
});

router.get('/:id', (req, res, next) => {
  Promise.resolve(getNoteById(req, res)).catch(next);
});

router.put('/:id', (req, res, next) => {
  Promise.resolve(updateNote(req, res)).catch(next);
});

router.delete('/:id', (req, res, next) => {
  Promise.resolve(deleteNote(req, res)).catch(next);
});

module.exports = router;

