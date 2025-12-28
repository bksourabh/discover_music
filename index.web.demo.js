/**
 * Web entry point for Demo mode (skips login)
 * Run with: npm run web:demo
 */
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.demo';

// Simple initialization
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(React.createElement(App));
} else {
  console.error('Root element not found!');
}
