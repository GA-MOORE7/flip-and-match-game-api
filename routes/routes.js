const express = require('express');
const Puzzle = require('../models/model');

const router = express.Router();

// --------------------------
// POST /api/puzzles
// Create a new puzzle
// --------------------------
router.post('/puzzles', async (req, res) => {
  try {
    const { name, items } = req.body;

    if (!name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Name and items are required.' });
    }

    const puzzle = new Puzzle({ name, items });
    const savedPuzzle = await puzzle.save();

    res.status(201).json({
      message: 'Puzzle created successfully!',
      puzzle: savedPuzzle
    });
  } catch (err) {
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


