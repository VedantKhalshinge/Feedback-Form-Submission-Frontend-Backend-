/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  ============================================================================= 
*/
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  attachmentUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
