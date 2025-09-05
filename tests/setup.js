// Jest setup file
require('jest-environment-jsdom');

// Mock console methods in tests unless explicitly testing them
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.gtag for analytics tests
global.gtag = jest.fn();

// Mock dataLayer for Google Analytics
global.dataLayer = [];

// Setup DOM testing utilities
global.createMockElement = (tag, attributes = {}) => {
  const element = document.createElement(tag);
  Object.keys(attributes).forEach(key => {
    element.setAttribute(key, attributes[key]);
  });
  return element;
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  global.dataLayer = [];
});