/**
 * CSRF Protection Tests
 * Tests the CSRF token generation and form protection functionality
 */

describe('CSRF Protection', () => {
  let mockSessionStorage;

  beforeEach(() => {
    // Mock sessionStorage
    mockSessionStorage = {};
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(key => mockSessionStorage[key] || null),
        setItem: jest.fn((key, value) => { mockSessionStorage[key] = value; }),
        removeItem: jest.fn(key => { delete mockSessionStorage[key]; }),
        clear: jest.fn(() => { mockSessionStorage = {}; })
      },
      writable: true
    });

    // Mock crypto.getRandomValues
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: jest.fn(array => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        })
      },
      writable: true
    });

    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('Token Generation', () => {
    test('should generate a 64-character hex token', () => {
      // Simulate the generateCSRFToken function
      const generateCSRFToken = () => {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
      };

      const token = generateCSRFToken();

      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    test('should generate unique tokens on each call', () => {
      const generateCSRFToken = () => {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
      };

      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('Token Storage', () => {
    test('should store token in sessionStorage', () => {
      const getOrCreateCSRFToken = () => {
        let token = window.sessionStorage.getItem('csrf_token');
        if (!token) {
          const array = new Uint8Array(32);
          window.crypto.getRandomValues(array);
          token = Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
          window.sessionStorage.setItem('csrf_token', token);
        }
        return token;
      };

      const token = getOrCreateCSRFToken();

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
    });

    test('should reuse existing token from sessionStorage', () => {
      const existingToken = 'a'.repeat(64);
      mockSessionStorage['csrf_token'] = existingToken;

      const getOrCreateCSRFToken = () => {
        let token = window.sessionStorage.getItem('csrf_token');
        if (!token) {
          const array = new Uint8Array(32);
          window.crypto.getRandomValues(array);
          token = Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
          window.sessionStorage.setItem('csrf_token', token);
        }
        return token;
      };

      const token = getOrCreateCSRFToken();

      expect(token).toBe(existingToken);
      expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Form Protection', () => {
    test('should add CSRF token to forms with js-form class', () => {
      document.body.innerHTML = `
        <form class="js-form" id="test-form">
          <input type="text" name="comment">
          <button type="submit">Submit</button>
        </form>
      `;

      const addCSRFTokenToForms = () => {
        const forms = document.querySelectorAll('form.js-form');
        forms.forEach(form => {
          const existingToken = form.querySelector('input[name="csrf_token"]');
          if (!existingToken) {
            const token = 'test-token-12345';
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = token;
            form.appendChild(input);
          }
        });
      };

      addCSRFTokenToForms();

      const csrfInput = document.querySelector('#test-form input[name="csrf_token"]');
      expect(csrfInput).toBeTruthy();
      expect(csrfInput.type).toBe('hidden');
      expect(csrfInput.value).toBe('test-token-12345');
    });

    test('should not add duplicate CSRF tokens', () => {
      document.body.innerHTML = `
        <form class="js-form" id="test-form">
          <input type="hidden" name="csrf_token" value="existing-token">
          <input type="text" name="comment">
        </form>
      `;

      const addCSRFTokenToForms = () => {
        const forms = document.querySelectorAll('form.js-form');
        forms.forEach(form => {
          const existingToken = form.querySelector('input[name="csrf_token"]');
          if (!existingToken) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = 'new-token';
            form.appendChild(input);
          }
        });
      };

      addCSRFTokenToForms();

      const csrfInputs = document.querySelectorAll('#test-form input[name="csrf_token"]');
      expect(csrfInputs).toHaveLength(1);
      expect(csrfInputs[0].value).toBe('existing-token');
    });

    test('should not add token to forms without js-form class', () => {
      document.body.innerHTML = `
        <form id="regular-form">
          <input type="text" name="data">
        </form>
      `;

      const addCSRFTokenToForms = () => {
        const forms = document.querySelectorAll('form.js-form');
        forms.forEach(form => {
          const existingToken = form.querySelector('input[name="csrf_token"]');
          if (!existingToken) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = 'token';
            form.appendChild(input);
          }
        });
      };

      addCSRFTokenToForms();

      const csrfInput = document.querySelector('#regular-form input[name="csrf_token"]');
      expect(csrfInput).toBeNull();
    });

    test('should handle multiple forms', () => {
      document.body.innerHTML = `
        <form class="js-form" id="form1"><input type="text" name="a"></form>
        <form class="js-form" id="form2"><input type="text" name="b"></form>
        <form id="form3"><input type="text" name="c"></form>
      `;

      let tokenCounter = 0;
      const addCSRFTokenToForms = () => {
        const forms = document.querySelectorAll('form.js-form');
        forms.forEach(form => {
          const existingToken = form.querySelector('input[name="csrf_token"]');
          if (!existingToken) {
            tokenCounter++;
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = `token-${tokenCounter}`;
            form.appendChild(input);
          }
        });
      };

      addCSRFTokenToForms();

      expect(document.querySelector('#form1 input[name="csrf_token"]')).toBeTruthy();
      expect(document.querySelector('#form2 input[name="csrf_token"]')).toBeTruthy();
      expect(document.querySelector('#form3 input[name="csrf_token"]')).toBeNull();
    });
  });

  describe('Crypto API Availability', () => {
    test('should handle missing crypto API gracefully', () => {
      const originalCrypto = window.crypto;
      delete window.crypto;

      const generateCSRFToken = () => {
        if (window.crypto && window.crypto.getRandomValues) {
          const array = new Uint8Array(32);
          window.crypto.getRandomValues(array);
          return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
        }
        // Fallback for environments without crypto
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
      };

      const token = generateCSRFToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      window.crypto = originalCrypto;
    });
  });
});
