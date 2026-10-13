const express = require('express');

const Quote = require('../models/Quote');

const router = express.Router();

// POST /api/quotes - a quote request submitted from the mobile app.
router.post('/', async (req, res, next) => {
  try {
    const { name, email, item, specifications } = req.body ?? {};

    if (!name || !email || !item || !specifications) {
      return res.status(400).json({
        error: 'name, email, item and specifications are required.',
      });
    }

    const quote = await Quote.create({ name, email, item, specifications });
    return res.status(201).json(quote);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

// GET /api/quotes - list quote requests, newest first.
// Optional filter: /api/quotes?email=someone@example.com
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.email) {
      filter.email = String(req.query.email).toLowerCase();
    }

    const quotes = await Quote.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json(quotes);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
