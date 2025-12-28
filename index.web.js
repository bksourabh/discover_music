/**
 * Web entry point for React Native Web
 */
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
    return;
  }
  
  const root = createRoot(rootElement);
  root.render(React.createElement(App));
}
