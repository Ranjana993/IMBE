// backend/app.js or server.js
const express = require('express');
require('dotenv').config();
const mediaRouter = require('./route/route');

const cors = require('cors');



const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000
app.use(cors()); // Enable CORS for all routes
// Middleware
app.use(express.json());

// Routes
app.use('/api/media', mediaRouter);

// Basic route to show server is running
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend Server is Running</h1>
    <p>Server is running on port ${PORT}</p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Media endpoint available at http://localhost:${PORT}/api/media/:mediaId`);
});