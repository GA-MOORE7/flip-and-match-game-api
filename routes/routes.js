const express = require('express');
const { v2: cloudinary } = require('cloudinary');
const Puzzle = require('../models/model');

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// --------------------------
// POST /api/puzzles
// Create a new puzzle from base64 images
// --------------------------
router.post('/puzzles', async (req, res) => {
  try {
    const { name, items } = req.body; // items = [{ word, image (base64), timestamp }, ...]

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Name and items are required.' });
    }

    // Upload each base64 image to Cloudinary
    const uploadedItems = [];
    for (let item of items) {
      const result = await cloudinary.uploader.upload(item.image, {
        folder: `flip-match/${name}`,
      });

      uploadedItems.push({
        word: item.word,
        imageUrl: result.secure_url,
        timestamp: item.timestamp,
      });
    }

    // Save the puzzle in MongoDB
    const puzzle = new Puzzle({ name, items: uploadedItems });
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

// --------------------------
// GET /api/puzzles/:id
// Retrieve a specific puzzle by ID
// --------------------------
router.get('/puzzles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const puzzle = await Puzzle.findById(id);

    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found.' });
    }

    res.status(200).json(puzzle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve puzzle.' });
  }
});

// --------------------------
// DELETE /api/puzzles/:id
// Delete puzzle + Cloudinary assets
// --------------------------
router.delete('/puzzles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const puzzle = await Puzzle.findById(id);

    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found.' });
    }

    // Delete all images in the puzzle folder
    const folderPath = `flip-match/${puzzle.name}`;

    await cloudinary.api.delete_resources_by_prefix(folderPath);
    await cloudinary.api.delete_folder(folderPath);

    // Delete puzzle from MongoDB
    await Puzzle.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Puzzle and images deleted successfully.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;




