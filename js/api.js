/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  ============================================================================= 
*/

/**
 * Submits feedback data to the backend.
 * @param {FormData} formData - The FormData object containing text and files.
 * @returns {Promise<Object>} Response object from the server.
 */
async function submitFeedbackApi(formData) {
  try {
    const response = await fetch('/feedback', {
      method: 'POST',
      body: formData // No Content-Type header required for FormData
    });

    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error("Network Error:", error);
    return {
      status: 500,
      data: { success: false, errors: ["Network error. Please ensure the server is running and try again."] }
    };
  }
}
