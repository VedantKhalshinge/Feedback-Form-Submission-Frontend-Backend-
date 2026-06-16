/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  Unauthorized copying, modification, or distribution is strictly prohibited.
  ============================================================================= 
*/

// In-memory array to store feedback
const feedbackList = [];
let nextId = 1;

/**
 * Saves a new feedback submission.
 * @param {Object} feedbackData - The sanitized data to save.
 * @returns {Object} The saved feedback object with ID and timestamp.
 */
function addFeedback(feedbackData) {
  const newFeedback = {
    id: nextId++,
    name: feedbackData.name,
    email: feedbackData.email,
    message: feedbackData.message,
    createdAt: new Date().toISOString()
  };
  
  feedbackList.push(newFeedback);
  return newFeedback;
}

/**
 * Retrieves all stored feedback.
 * @returns {Array} List of all feedback entries.
 */
function getAllFeedback() {
  return feedbackList;
}

/**
 * Clears the feedback array (Useful for testing).
 */
function clearFeedback() {
  feedbackList.length = 0;
  nextId = 1;
}

module.exports = {
  addFeedback,
  getAllFeedback,
  clearFeedback
};
