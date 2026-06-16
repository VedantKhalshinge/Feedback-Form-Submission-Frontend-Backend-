/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  ============================================================================= 
*/
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Feedback = require('./models/Feedback');

// ── Multer Configuration ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed!'), false);
  }
};
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// ── Validation Helpers ──────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// ── Routes ──────────────────────────────────────────────────────────
router.post('/feedback', (req, res) => {
  upload.single('attachment')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, errors: [err.message] });
    } else if (err) {
      return res.status(400).json({ success: false, errors: [err.message] });
    }

    const { name, email, message } = req.body;
    const errors = [];

    // Validation
    if (!name || name.trim() === '') errors.push("Name is required.");
    if (!email || email.trim() === '') errors.push("Email is required.");
    else if (!EMAIL_REGEX.test(email.trim())) errors.push("Email must be a valid format.");
    if (!message || message.trim() === '') errors.push("Message is required.");

    if (errors.length > 0) return res.status(400).json({ success: false, errors });

    // Sanitization
    const sanitizedData = {
      name: sanitize(name.trim()),
      email: sanitize(email.trim()),
      message: sanitize(message.trim())
    };

    if (req.file) {
      sanitizedData.attachmentUrl = '/uploads/' + req.file.filename;
    }

    try {
      const newFeedback = new Feedback(sanitizedData);
      await newFeedback.save();
      console.log(`✅ [MongoDB] Feedback stored from ${sanitizedData.name}`);
      return res.status(201).json({ success: true, message: "Feedback submitted successfully." });
    } catch (dbErr) {
      console.error("Database Save Error:", dbErr.message);
      return res.status(500).json({ success: false, errors: ["Failed to save to database. Ensure MongoDB is running."] });
    }
  });
});

router.delete('/feedback', async (req, res) => {
  try {
    await Feedback.deleteMany({});
    res.json({ success: true, message: "All submissions cleared successfully." });
  } catch(e) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
