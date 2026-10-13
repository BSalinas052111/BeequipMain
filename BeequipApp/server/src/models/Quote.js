const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'A valid email address is required.'],
    },
    item: { type: String, required: true, trim: true, maxlength: 300 },
    specifications: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'quoted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Quote', quoteSchema);
