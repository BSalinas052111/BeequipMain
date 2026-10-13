const express = require('express');

const Item = require('../models/Item');

const router = express.Router();

// GET /api/items - product catalogue.
// The app currently ships its inventory in src/inventory.ts, but this endpoint
// lets you move the catalogue into MongoDB later without changing the app's API.
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const items = await Item.find(filter).sort({ category: 1, title: 1 });
    return res.json(items);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
