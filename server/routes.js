/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  Unauthorized copying, modification, or distribution is strictly prohibited.
  ============================================================================= 
*/
const express = require('express');
const router = express.Router();
const feedbackStore = require('./feedbackStore');

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple HTML escaping for XSS protection
function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

router.post('/feedback', (req, res) => {
  const { name, email, message } = req.body;
  const errors = [];

  // 1. Validation
  if (!name || name.trim() === '') errors.push("Name is required.");
  if (!email || email.trim() === '') errors.push("Email is required.");
  else if (!EMAIL_REGEX.test(email.trim())) errors.push("Email must be a valid format.");
  
  if (!message || message.trim() === '') errors.push("Message is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // 2. Sanitization
  const sanitizedData = {
    name: sanitize(name.trim()),
    email: sanitize(email.trim()),
    message: sanitize(message.trim())
  };

  // 3. Store Data
  const savedEntry = feedbackStore.addFeedback(sanitizedData);
  console.log(`✅ [Memory] Feedback #${savedEntry.id} stored from ${savedEntry.name} <${savedEntry.email}>`);

  // 4. Return Success
  return res.status(201).json({
    success: true,
    message: "Feedback submitted successfully."
  });
});

// Optional: Route to clear submissions for testing
router.delete('/feedback', (req, res) => {
  feedbackStore.clearFeedback();
  console.log("🗑️  All feedback submissions have been cleared.");
  res.json({ success: true, message: "All submissions cleared successfully." });
});

module.exports = router;
