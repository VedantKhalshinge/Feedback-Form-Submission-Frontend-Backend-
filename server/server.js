/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  ============================================================================= 
*/
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3050;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-db';

// ── Database Connection ─────────────────────────────────────────────
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => console.log('📦  MongoDB Connected securely.'))
  .catch(err => {
    console.warn(`⚠️  MongoDB unavailable (connect ECONNREFUSED). Make sure MongoDB is running on port 27017.`);
  });

// ── Middleware ──────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Rate Limiting (Anti-Spam) ───────────────────────────────────────
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, errors: ['Too many submissions. Please try again later.'] }
});
app.use('/feedback', feedbackLimiter);

// ── Routes ──────────────────────────────────────────────────────────
app.use('/', routes);

// ── Static Files ────────────────────────────────────────────────────
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Minimal Feedback Server running at http://localhost:${PORT}`);
});
