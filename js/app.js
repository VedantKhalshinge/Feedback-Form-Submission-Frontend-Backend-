/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  ============================================================================= 
*/

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Client-side Validation
    const validationErrors = validateFeedbackForm(name, email, message);
    if (validationErrors.length > 0) {
      UI.showError(validationErrors);
      return;
    }

    // Prepare API Request
    UI.setLoading(true);

    const payload = { name, email, message };
    const response = await submitFeedbackApi(payload);

    UI.setLoading(false);

    // Handle Response
    if (response.status === 201 && response.data.success) {
      UI.showSuccess(response.data.message);
      UI.resetForm();
    } else {
      // Show server validation errors or general errors
      const errors = response.data.errors || ["An unexpected error occurred."];
      UI.showError(errors);
    }
  });
});
