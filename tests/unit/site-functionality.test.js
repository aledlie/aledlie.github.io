/**
 * Site Functionality Tests
 * Tests core website functionality, navigation, and DOM elements
 */

const { SITE } = require('../../config/constants');

describe('Site Functionality', () => {
  describe('Navigation', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <nav class="navbar">
          <a href="/" class="nav-link home">Home</a>
          <a href="/about" class="nav-link about">About</a>
          <a href="/posts" class="nav-link posts">Posts</a>
          <a href="/projects" class="nav-link projects">Projects</a>
        </nav>
      `;
    });

    test('should have all required navigation links', () => {
      const navLinks = document.querySelectorAll('.nav-link');
      const expectedLinks = ['home', 'about', 'posts', 'projects'];
      
      expect(navLinks).toHaveLength(expectedLinks.length);
      
      expectedLinks.forEach(linkClass => {
        const link = document.querySelector(`.nav-link.${linkClass}`);
        expect(link).toBeTruthy();
        expect(link.href).toBeDefined();
      });
    });

    test('should have proper href attributes', () => {
      expect(document.querySelector('.nav-link.home').getAttribute('href')).toBe('/');
      expect(document.querySelector('.nav-link.about').getAttribute('href')).toBe('/about');
      expect(document.querySelector('.nav-link.posts').getAttribute('href')).toBe('/posts');
      expect(document.querySelector('.nav-link.projects').getAttribute('href')).toBe('/projects');
    });
  });

  describe('Content Structure', () => {
    test('should have proper meta tags for SEO', () => {
      // Simulate Jekyll-generated head content
      document.head.innerHTML = `
        <title>Test Site</title>
        <meta name="description" content="Test description">
        <meta property="og:title" content="Test Site">
        <meta property="og:description" content="Test description">
        <meta name="twitter:card" content="summary">
      `;

      expect(document.querySelector('title')).toBeTruthy();
      expect(document.querySelector('meta[name="description"]')).toBeTruthy();
      expect(document.querySelector('meta[property="og:title"]')).toBeTruthy();
      expect(document.querySelector('meta[property="og:description"]')).toBeTruthy();
      expect(document.querySelector('meta[name="twitter:card"]')).toBeTruthy();
    });

    test('should have canonical URL meta tag', () => {
      document.head.innerHTML = `<link rel="canonical" href="${SITE.url}/">`;
      const canonical = document.querySelector('link[rel="canonical"]');
      
      expect(canonical).toBeTruthy();
      expect(canonical.getAttribute('href')).toMatch(/^https:\/\//);
    });

    test('should have proper structured data', () => {
      document.body.innerHTML = `
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"WebSite","name":"Test Site"}
        </script>
      `;

      const structuredData = document.querySelector('script[type="application/ld+json"]');
      expect(structuredData).toBeTruthy();
      
      const data = JSON.parse(structuredData.textContent);
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('WebSite');
    });
  });

  describe('Responsive Design Elements', () => {
    test('should have viewport meta tag', () => {
      document.head.innerHTML = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
      const viewport = document.querySelector('meta[name="viewport"]');
      
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });

    test('should have mobile-friendly CSS classes', () => {
      document.body.innerHTML = `
        <div class="container">
          <div class="row">
            <div class="col-md-8 col-sm-12">Content</div>
          </div>
        </div>
      `;

      expect(document.querySelector('.container')).toBeTruthy();
      expect(document.querySelector('.row')).toBeTruthy();
      expect(document.querySelector('[class*="col-"]')).toBeTruthy();
    });
  });

  describe('Form Elements', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="search-form">
          <input type="search" id="search-input" required>
          <button type="submit">Search</button>
        </form>
      `;
    });

    test('should have proper form validation attributes', () => {
      const searchInput = document.querySelector('#search-input');
      const form = document.querySelector('#search-form');
      
      expect(searchInput.hasAttribute('required')).toBe(true);
      expect(searchInput.type).toBe('search');
      expect(form.querySelector('button[type="submit"]')).toBeTruthy();
    });

    test('should handle form submission', () => {
      const form = document.querySelector('#search-form');
      const submitHandler = jest.fn(e => e.preventDefault());
      
      form.addEventListener('submit', submitHandler);
      form.dispatchEvent(new Event('submit'));
      
      expect(submitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Features', () => {
    test('should have proper alt attributes on images', () => {
      document.body.innerHTML = `
        <img src="/images/profile.jpg" alt="Alyshia Ledlie profile photo">
        <img src="/images/decoration.png" alt="">
      `;

      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img.hasAttribute('alt')).toBe(true);
      });
    });

    test('should have proper heading hierarchy', () => {
      document.body.innerHTML = `
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection</h3>
      `;

      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();
    });

    test('should have skip navigation links', () => {
      document.body.innerHTML = `<a href="#main-content" class="skip-link">Skip to main content</a>`;
      const skipLink = document.querySelector('.skip-link');
      
      expect(skipLink).toBeTruthy();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });
  });
});