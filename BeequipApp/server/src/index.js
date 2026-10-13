require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { connectToDatabase } = require('./db');
const quotesRouter = require('./routes/quotes');
const itemsRouter = require('./routes/items');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const app = express();

  // Allow the Expo app (running on a device/emulator on the same network) to call us.
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/quotes', quotesRouter);
  app.use('/api/items', itemsRouter);

  // Central error handler.
  app.use((error, req, res, next) => {
    console.error('[api] Unhandled error:', error);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });

  try {
    await connectToDatabase();
  } catch (error) {
    console.error('[db] Could not connect to MongoDB:', error.message);
    console.error('     Is the MongoDB Community service running on port 27017?');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[api] Beequip API listening on http://localhost:${PORT}`);
  });

  // Report common startup errors instead of crashing with an unhandled 'error' event.
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[api] Port ${PORT} is already in use.`);
      console.error('     Another instance of the API is probably already running.');
      console.error('     Check http://localhost:3000/api/health, or close the other instance.');
    } else {
      console.error('[api] Server error:', error.message);
    }
    process.exit(1);
  });
}

start();
