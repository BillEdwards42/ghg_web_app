import { describe, it, expect, beforeEach } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

// We register happy-dom so `document` and `window` exist globally
GlobalRegistrator.register();

// We'll import our selection logic to test it
import { initSelectionModals } from '../js/selection.js';

describe('Selection Modal Logic', () => {
  beforeEach(() => {
    // Set up a mock DOM structure representing the new index.html layout
    document.body.innerHTML = `
      <div id="home-screen">
        <div class="selection-trigger" id="corp-trigger">
          <span class="select-value" id="corp-select-value">Default Corporate</span>
        </div>
        
        <div class="full-screen-modal hidden" id="corp-modal">
          <div class="modal-header">
            <button class="btn-close-modal">X</button>
          </div>
          <div class="modal-body" id="corp-select-menu"></div>
        </div>
      </div>
    `;
    
    // Initialize our logic
    initSelectionModals();
  });

  it('clicking the trigger should open the modal', () => {
    const trigger = document.getElementById('corp-trigger');
    const modal = document.getElementById('corp-modal');
    
    expect(modal.classList.contains('hidden')).toBe(true);
    trigger.click();
    expect(modal.classList.contains('hidden')).toBe(false);
  });

  it('clicking the close button should hide the modal', () => {
    const trigger = document.getElementById('corp-trigger');
    const modal = document.getElementById('corp-modal');
    const closeBtn = modal.querySelector('.btn-close-modal');
    
    trigger.click();
    closeBtn.click();
    expect(modal.classList.contains('hidden')).toBe(true);
  });

  it('selecting a leaf node should update the trigger text and close the modal', () => {
    const trigger = document.getElementById('corp-trigger');
    const modal = document.getElementById('corp-modal');
    const valueSpan = document.getElementById('corp-select-value');
    
    trigger.click();
    
    // Find the first leaf node
    const leafNodes = document.querySelectorAll('.tree-node');
    expect(leafNodes.length).toBeGreaterThan(0);
    
    const nodeText = leafNodes[0].querySelector('.node-text').textContent;
    leafNodes[0].click();
    
    expect(valueSpan.textContent).toBe(nodeText);
    expect(modal.classList.contains('hidden')).toBe(true);
  });
});
