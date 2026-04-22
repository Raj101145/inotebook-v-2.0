const Note = require('../models/Note');

async function createNote(req, res) {
  const { title, description } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: 'title is required' });
  }

  const note = await Note.create({
    title: String(title).trim(),
    description: description == null ? '' : String(description),
    user: req.user.id,
  });

  return res.status(201).json({ note });
}

async function getMyNotes(req, res) {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  return res.json({ notes });
}

async function updateNote(req, res) {
  const { id } = req.params;
  const { title, description } = req.body || {};

  const update = {};
  if (title !== undefined) update.title = String(title).trim();
  if (description !== undefined) update.description = String(description);

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: 'nothing to update' });
  }

  const note = await Note.findOneAndUpdate(
    { _id: id, user: req.user.id },
    update,
    { new: true, runValidators: true }
  );

  if (!note) return res.status(404).json({ message: 'note not found' });
  return res.json({ note });
}

async function deleteNote(req, res) {
  const { id } = req.params;

  const note = await Note.findOneAndDelete({ _id: id, user: req.user.id });
  if (!note) return res.status(404).json({ message: 'note not found' });

  return res.json({ ok: true });
}

module.exports = { createNote, getMyNotes, updateNote, deleteNote };

