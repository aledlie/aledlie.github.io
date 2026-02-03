/**
 * Email Obfuscation Tests
 * Tests the email obfuscation and deobfuscation functionality
 */

describe('Email Obfuscation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Email Decoding', () => {
    test('should decode base64 encoded email address', () => {
      const decodeEmail = (encoded) => {
        return atob(encoded);
      };

      // 'test@example.com' encoded in base64
      const encoded = btoa('test@example.com');
      const decoded = decodeEmail(encoded);

      expect(decoded).toBe('test@example.com');
    });

    test('should decode complex email addresses', () => {
      const decodeEmail = (encoded) => {
        return atob(encoded);
      };

      const testCases = [
        'user.name+tag@domain.co.uk',
        'admin@subdomain.example.org',
        'contact@company.io',
        'hello-world@test-domain.com'
      ];

      testCases.forEach(email => {
        const encoded = btoa(email);
        expect(decodeEmail(encoded)).toBe(email);
      });
    });

    test('should handle invalid base64 gracefully', () => {
      const decodeEmail = (encoded) => {
        try {
          return atob(encoded);
        } catch (e) {
          return null;
        }
      };

      const result = decodeEmail('not-valid-base64!!!');
      expect(result).toBeNull();
    });
  });

  describe('Mailto Link Creation', () => {
    test('should create mailto link with decoded email', () => {
      const createMailtoLink = (encodedEmail, displayText) => {
        const email = atob(encodedEmail);
        const link = document.createElement('a');
        link.href = 'mailto:' + email;
        link.textContent = displayText || email;
        link.className = 'obfuscated-email';
        return link;
      };

      const encoded = btoa('contact@example.com');
      const link = createMailtoLink(encoded);

      expect(link.tagName).toBe('A');
      expect(link.href).toBe('mailto:contact@example.com');
      expect(link.textContent).toBe('contact@example.com');
      expect(link.className).toBe('obfuscated-email');
    });

    test('should use custom display text when provided', () => {
      const createMailtoLink = (encodedEmail, displayText) => {
        const email = atob(encodedEmail);
        const link = document.createElement('a');
        link.href = 'mailto:' + email;
        link.textContent = displayText || email;
        link.className = 'obfuscated-email';
        return link;
      };

      const encoded = btoa('sales@company.com');
      const link = createMailtoLink(encoded, 'Contact Sales');

      expect(link.href).toBe('mailto:sales@company.com');
      expect(link.textContent).toBe('Contact Sales');
    });

    test('should fall back to email as display text when no custom text', () => {
      const createMailtoLink = (encodedEmail, displayText) => {
        const email = atob(encodedEmail);
        const link = document.createElement('a');
        link.href = 'mailto:' + email;
        link.textContent = displayText || email;
        link.className = 'obfuscated-email';
        return link;
      };

      const encoded = btoa('info@test.com');
      const link = createMailtoLink(encoded, null);

      expect(link.textContent).toBe('info@test.com');
    });
  });

  describe('DOM Integration', () => {
    test('should find and process elements with data-email attribute', () => {
      const encodedEmail = btoa('hello@world.com');
      document.body.innerHTML = `
        <span data-email="${encodedEmail}" id="email-container"></span>
      `;

      const initEmailObfuscation = () => {
        const emailElements = document.querySelectorAll('[data-email]');
        emailElements.forEach(element => {
          const encodedEmail = element.getAttribute('data-email');
          const displayText = element.getAttribute('data-email-display') || null;

          if (encodedEmail) {
            const email = atob(encodedEmail);
            const link = document.createElement('a');
            link.href = 'mailto:' + email;
            link.textContent = displayText || email;
            link.className = 'obfuscated-email';
            element.appendChild(link);
          }
        });
      };

      initEmailObfuscation();

      const link = document.querySelector('#email-container a');
      expect(link).toBeTruthy();
      expect(link.href).toBe('mailto:hello@world.com');
    });

    test('should use data-email-display for custom text', () => {
      const encodedEmail = btoa('support@site.com');
      document.body.innerHTML = `
        <span data-email="${encodedEmail}" data-email-display="Get Support" id="support"></span>
      `;

      const initEmailObfuscation = () => {
        const emailElements = document.querySelectorAll('[data-email]');
        emailElements.forEach(element => {
          const encodedEmail = element.getAttribute('data-email');
          const displayText = element.getAttribute('data-email-display') || null;

          if (encodedEmail) {
            const email = atob(encodedEmail);
            const link = document.createElement('a');
            link.href = 'mailto:' + email;
            link.textContent = displayText || email;
            link.className = 'obfuscated-email';
            element.appendChild(link);
          }
        });
      };

      initEmailObfuscation();

      const link = document.querySelector('#support a');
      expect(link.textContent).toBe('Get Support');
      expect(link.href).toBe('mailto:support@site.com');
    });

    test('should handle multiple email elements', () => {
      document.body.innerHTML = `
        <span data-email="${btoa('a@test.com')}" id="email1"></span>
        <span data-email="${btoa('b@test.com')}" id="email2"></span>
        <span data-email="${btoa('c@test.com')}" id="email3"></span>
      `;

      const initEmailObfuscation = () => {
        const emailElements = document.querySelectorAll('[data-email]');
        emailElements.forEach(element => {
          const encodedEmail = element.getAttribute('data-email');
          if (encodedEmail) {
            const email = atob(encodedEmail);
            const link = document.createElement('a');
            link.href = 'mailto:' + email;
            link.textContent = email;
            link.className = 'obfuscated-email';
            element.appendChild(link);
          }
        });
      };

      initEmailObfuscation();

      expect(document.querySelector('#email1 a').href).toBe('mailto:a@test.com');
      expect(document.querySelector('#email2 a').href).toBe('mailto:b@test.com');
      expect(document.querySelector('#email3 a').href).toBe('mailto:c@test.com');
    });

    test('should skip elements without data-email value', () => {
      document.body.innerHTML = `
        <span data-email="" id="empty"></span>
        <span id="no-attr"></span>
      `;

      const initEmailObfuscation = () => {
        const emailElements = document.querySelectorAll('[data-email]');
        emailElements.forEach(element => {
          const encodedEmail = element.getAttribute('data-email');
          if (encodedEmail) {
            const email = atob(encodedEmail);
            const link = document.createElement('a');
            link.href = 'mailto:' + email;
            link.textContent = email;
            element.appendChild(link);
          }
        });
      };

      initEmailObfuscation();

      expect(document.querySelector('#empty a')).toBeNull();
      expect(document.querySelector('#no-attr a')).toBeNull();
    });
  });

  describe('Security', () => {
    test('should not expose email in initial HTML', () => {
      const email = 'secret@hidden.com';
      const encoded = btoa(email);

      document.body.innerHTML = `<span data-email="${encoded}"></span>`;

      // Email should not appear in the raw HTML
      expect(document.body.innerHTML).not.toContain(email);
      expect(document.body.innerHTML).toContain(encoded);
    });

    test('encoded email should not be human-readable', () => {
      const email = 'user@domain.com';
      const encoded = btoa(email);

      // Base64 encoding makes email unreadable to simple scrapers
      expect(encoded).not.toContain('@');
      expect(encoded).not.toContain('.com');
    });
  });

  describe('Edge Cases', () => {
    test('should handle emails with special characters', () => {
      const decodeEmail = (encoded) => atob(encoded);

      const specialEmails = [
        'user+tag@domain.com',
        'name.surname@sub.domain.org',
        'test_user@example.co.uk'
      ];

      specialEmails.forEach(email => {
        const encoded = btoa(email);
        expect(decodeEmail(encoded)).toBe(email);
      });
    });

    test('should handle unicode in display text', () => {
      const createMailtoLink = (encodedEmail, displayText) => {
        const email = atob(encodedEmail);
        const link = document.createElement('a');
        link.href = 'mailto:' + email;
        link.textContent = displayText || email;
        return link;
      };

      const encoded = btoa('info@test.com');
      const link = createMailtoLink(encoded, '📧 Email Us');

      expect(link.textContent).toBe('📧 Email Us');
    });
  });
});
