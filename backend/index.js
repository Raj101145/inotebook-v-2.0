require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectToDatabase } = require('./src/db');
const authRouter = require('./src/routes/auth');
const notesRouter = require('./src/routes/notes');
const { notFound } = require('./src/middleware/notFound');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/notes', notesRouter);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exitCode = 1;
  });

