// Simple CSRF protection for comment forms
(function() {
  'use strict';

  // Generate a simple CSRF token
  function generateCSRFToken() {
    var array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    var token = Array.from(array, function(byte) {
      return ('0' + byte.toString(16)).slice(-2);
    }).join('');
    return token;
  }

  // Store token in sessionStorage
  function getOrCreateCSRFToken() {
    var token = sessionStorage.getItem('csrf_token');
    if (!token) {
      token = generateCSRFToken();
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  }

  // Add CSRF token to forms
  function addCSRFTokenToForms() {
    var forms = document.querySelectorAll('form.js-form');

    forms.forEach(function(form) {
      // Check if CSRF token already exists
      var existingToken = form.querySelector('input[name="csrf_token"]');
      if (!existingToken) {
        var token = getOrCreateCSRFToken();
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = token;
        form.appendChild(input);
      }
    });
  }

  // Initialize CSRF protection when DOM is ready
  function initCSRFProtection() {
    addCSRFTokenToForms();

    // Re-apply if forms are dynamically added
    var observer = new MutationObserver(function() {
      addCSRFTokenToForms();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCSRFProtection);
  } else {
    initCSRFProtection();
  }
})();
