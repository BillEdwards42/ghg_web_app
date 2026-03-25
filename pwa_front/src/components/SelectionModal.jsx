import React from 'react';

function SelectionModal({ title, items, isOpen, onClose, onSelect, selectedItem, isLoc }) {
  if (!isOpen) return null;

  const getIconSvg = (isBuilding) => {
    if (isBuilding) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <path d="M9 22v-4h6v4"></path>
          <path d="M8 6h.01"></path>
          <path d="M16 6h.01"></path>
          <path d="M12 6h.01"></path>
          <path d="M12 10h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 10h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 10h.01"></path>
          <path d="M8 14h.01"></path>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    );
  };

  return (
    <div className="full-screen-modal">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="btn-close-modal" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="modal-body">
        {items.map((item, idx) => (
          <div 
            key={item.id || idx} 
            className={`tree-node ${selectedItem?.id === item.id ? 'active' : ''}`}
            onClick={() => {
              onSelect(item);
              onClose();
            }}
          >
            <div className="node-icon">{getIconSvg(!isLoc)}</div>
            <div className="node-text">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectionModal;
