/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  ============================================================================= 
*/

/**
 * Validates the feedback form inputs.
 * @param {string} name 
 * @param {string} email 
 * @param {string} message 
 * @returns {Array<string>} List of error messages. Empty array if valid.
 */
function validateFeedbackForm(name, email, message) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.trim() === '') {
    errors.push("Full Name is required.");
  }

  if (!email || email.trim() === '') {
    errors.push("Email Address is required.");
  } else if (!emailRegex.test(email.trim())) {
    errors.push("Please enter a valid email address.");
  }

  if (!message || message.trim() === '') {
    errors.push("Feedback Message is required.");
  }

  return errors;
}
