const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'New Equipment',
        'Used Equipment',
        'Process Equipment',
        'Rental Equipment',
      ],
    },
    title: { type: String, required: true, trim: true },
    priceRange: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Item', itemSchema);
