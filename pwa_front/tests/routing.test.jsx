import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';

GlobalRegistrator.register();

describe('React Router Navigation Logic', () => {
  let container = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    // Mock user as already logged in
    localStorage.setItem('isLoggedIn', 'true');
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    container = null;
    localStorage.clear();
  });

  it('renders Home component on / route', async () => {
    root.render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Wait for React concurrent rendering to flush
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check if the home screen container exists
    const homeScreen = document.getElementById('home-screen');
    expect(homeScreen).not.toBeNull();
  });

  it('renders ScanSelection component on /scan route', async () => {
    root.render(
      <MemoryRouter initialEntries={['/scan']}>
        <App />
      </MemoryRouter>
    );
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check if the scan modal view exists
    const scanView = document.getElementById('scan-view');
    expect(scanView).not.toBeNull();
  });
});
