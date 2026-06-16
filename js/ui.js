/* 
  =============================================================================
  © 2026 Vedant Khalshinge. All Rights Reserved.
  This code is the intellectual property of Vedant Khalshinge.
  ============================================================================= 
*/

const UI = {
  elements: {
    statusSection: document.getElementById('statusSection'),
    successMessage: document.getElementById('successMessage'),
    errorMessage: document.getElementById('errorMessage'),
    submitBtn: document.getElementById('submitBtn'),
    btnText: document.querySelector('.btn-text'),
    spinner: document.getElementById('loadingSpinner'),
    form: document.getElementById('feedbackForm')
  },

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.submitBtn.disabled = true;
      this.elements.btnText.textContent = "Sending...";
      this.elements.spinner.classList.remove('hidden');
      this.hideStatus();
    } else {
      this.elements.submitBtn.disabled = false;
      this.elements.btnText.textContent = "Send Feedback";
      this.elements.spinner.classList.add('hidden');
    }
  },

  showSuccess(message) {
    this.elements.statusSection.classList.remove('hidden');
    this.elements.errorMessage.classList.add('hidden');
    
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.classList.remove('hidden');
    this.elements.successMessage.classList.add('fade-in');
  },

  showError(errors) {
    this.elements.statusSection.classList.remove('hidden');
    this.elements.successMessage.classList.add('hidden');
    
    this.elements.errorMessage.innerHTML = '';
    
    if (Array.isArray(errors)) {
      const ul = document.createElement('ul');
      errors.forEach(err => {
        const li = document.createElement('li');
        li.textContent = err;
        ul.appendChild(li);
      });
      this.elements.errorMessage.appendChild(ul);
    } else {
      this.elements.errorMessage.textContent = errors;
    }

    this.elements.errorMessage.classList.remove('hidden');
    this.elements.errorMessage.classList.add('fade-in');
  },

  hideStatus() {
    this.elements.statusSection.classList.add('hidden');
    this.elements.successMessage.classList.add('hidden');
    this.elements.errorMessage.classList.add('hidden');
    this.elements.successMessage.classList.remove('fade-in');
    this.elements.errorMessage.classList.remove('fade-in');
  },

  resetForm() {
    this.elements.form.reset();
  }
};
