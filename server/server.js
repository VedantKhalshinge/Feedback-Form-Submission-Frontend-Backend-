/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  Unauthorized copying, modification, or distribution is strictly prohibited.
  ============================================================================= 
*/
const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3050;

// ── Middleware ──────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Rate Limiting (Anti-Spam) ───────────────────────────────────────
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 10,                    // limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errors: ['Too many submissions. Please try again later.']
  },
});
app.use('/feedback', feedbackLimiter);

// ── Routes ──────────────────────────────────────────────────────────
app.use('/', routes);

// ── Static Files ────────────────────────────────────────────────────
// Instead of serving the entire root, we only serve the required directories 
// and the index.html file to prevent exposing server files.
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Minimal Feedback Server running at http://localhost:${PORT}`);
});
