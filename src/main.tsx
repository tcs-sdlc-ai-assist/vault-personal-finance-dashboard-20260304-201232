import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

// Global styles
import './index.css';

// Detect if SSR hydration is needed (for future-proofing, Vite is CSR by default)
const container = document.getElementById('root');

if (!container) {
  // Fail gracefully if root element is missing
  throw new Error('Root element #root not found in index.html');
}

// Render the SPA using React 18's createRoot API
const renderApp = () => {
  // In Vault, we use client-side rendering only.
  // If SSR hydration is ever needed, use hydrateRoot.
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

renderApp();

// Hot Module Replacement (HMR) support for development
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    renderApp();
  });
}