// Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const path = require("path");

const app = express();

// Enable CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Serve public folder using absolute path
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", routes);

// MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Database Connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Start server using Heroku's port, fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);


