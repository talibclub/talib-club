// The notebook's inline CSS, kept out of ProNotebook.jsx so the 5,000-line
// component is not also a stylesheet. Rendered once by <NotebookStyles />.
import React from 'react';

export const NOTEBOOK_CSS = `    
      .hide-scroll::-webkit-scrollbar {
        display: none;
      }
      .hide-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .pulse-scroll-hint {
        animation: pulseHint 2s infinite ease-in-out;
      }
      @keyframes pulseHint {
        0%, 100% { opacity: 0.5; transform: translateX(0); }
        50% { opacity: 1; transform: translateX(-2px); }
      }
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      @keyframes spinSync {
        to { transform: rotate(360deg); }
      }
    `;

export default function NotebookStyles() {
  return <style>{NOTEBOOK_CSS}</style>;
}
