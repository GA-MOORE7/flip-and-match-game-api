const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());

// Increase JSON body size limit (e.g., 50mb)
app.use(express.json({ limit: '50mb' }));

// If you also need URL-encoded bodies
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', routes);

// MongoDB
mongoose.connect(process.env.DATABASE_URL);
const database = mongoose.connection;

database.on('error', (error) => console.log(error));
database.once('connected', () => console.log('Database Connected'));

// Start server
app.listen(3000, () => console.log('Server started on port 3000'));

