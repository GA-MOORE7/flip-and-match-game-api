const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String, // Cloudinary URL instead of base64
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
});

const puzzleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: {
    type: [itemSchema],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'A puzzle must have at least one item.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FlipMatchPuzzle', puzzleSchema);


