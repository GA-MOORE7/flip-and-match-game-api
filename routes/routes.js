const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const Puzzle = require('../models/model');

const router = express.Router();

// Multer setup — temporary local storage
const upload = multer({ dest: 'uploads/' });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// --------------------------
// POST /api/puzzles
// Create a new puzzle with image uploads
// --------------------------
router.post('/puzzles', upload.array('images'), async (req, res) => {
  try {
    const { name, words } = req.body;
    const files = req.files;

    if (!name || !words || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Name, words, and images are required.' });
    }

    const parsedWords = Array.isArray(words) ? words : JSON.parse(words);

    if (parsedWords.length !== files.length) {
      return res.status(400).json({ error: 'Each word must have a corresponding image.' });
    }

    // Upload each image to Cloudinary and build the items array
    const items = [];
    for (let i = 0; i < files.length; i++) {
      const result = await cloudinary.uploader.upload(files[i].path, {
        folder: `flip-match/${name}`,
      });

      items.push({
        word: parsedWords[i],
        imageUrl: result.secure_url,
        timestamp: Date.now(),
      });
    }

    // Save the puzzle in MongoDB
    const puzzle = new Puzzle({ name, items });
    const savedPuzzle = await puzzle.save();

    res.status(201).json({
      message: 'Puzzle created successfully!',
      puzzle: savedPuzzle,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------
// GET /api/puzzles
// Retrieve all puzzles
// --------------------------
router.get('/puzzles', async (req, res) => {
  try {
    const puzzles = await Puzzle.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(puzzles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


