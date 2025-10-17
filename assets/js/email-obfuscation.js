// Email obfuscation script to protect email addresses from harvesting bots
(function() {
  'use strict';

  // Function to decode email addresses
  function decodeEmail(encoded) {
    var address = atob(encoded);
    return address;
  }

  // Function to create mailto link
  function createMailtoLink(encodedEmail, displayText) {
    var email = decodeEmail(encodedEmail);
    var link = document.createElement('a');
    link.href = 'mailto:' + email;
    link.textContent = displayText || email;
    link.className = 'obfuscated-email';
    return link;
  }

  // Initialize email obfuscation when DOM is ready
  function initEmailObfuscation() {
    // Find all elements with data-email attribute
    var emailElements = document.querySelectorAll('[data-email]');

    emailElements.forEach(function(element) {
      var encodedEmail = element.getAttribute('data-email');
      var displayText = element.getAttribute('data-email-display') || null;

      if (encodedEmail) {
        var link = createMailtoLink(encodedEmail, displayText);
        element.appendChild(link);
      }
    });
  }

  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailObfuscation);
  } else {
    initEmailObfuscation();
  }
})();
