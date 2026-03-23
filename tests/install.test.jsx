import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from '../src/App.jsx';

GlobalRegistrator.register();

describe('Standalone Install Prompt Intercept Logic', () => {
  let container = null;
  let root = null;
  let originalMatchMedia;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock window.matchMedia natively
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    container = null;
    window.matchMedia = originalMatchMedia;
  });

  it('renders InstallPrompt when NOT standalone and NOT skipped', async () => {
    window.matchMedia = mock((query) => ({
      matches: false, // Browser tab, NOT standalone
      addEventListener: () => {},
      removeEventListener: () => {}
    }));

    root.render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that the intercept text is shown
    expect(document.body.textContent).toContain('請下載以獲得最佳體驗');
  });

  it('bypasses InstallPrompt when standalone is true', async () => {
    window.matchMedia = mock((query) => ({
      matches: true, // System app standalone mode
      addEventListener: () => {},
      removeEventListener: () => {}
    }));

    root.render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that the intercept screen is completely skipped natively
    expect(document.body.textContent).not.toContain('請下載以獲得最佳體驗');
    // Ensure the normal Login screen renders
    expect(document.body.textContent).toContain('GHG 數據採集');
  });
});
