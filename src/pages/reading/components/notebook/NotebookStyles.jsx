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
      @keyframes cutePop {
        0% { transform: scale(0.88) translateY(6px); opacity: 0; }
        60% { transform: scale(1.03) translateY(-1px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      @keyframes cuteFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      .cute-pop-in {
        animation: cutePop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      .cute-btn-press {
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.16s, box-shadow 0.16s !important;
      }
      .cute-btn-press:active {
        transform: scale(0.92) !important;
      }
      .cute-btn-press:hover {
        transform: translateY(-2px) scale(1.05);
      }
      .cute-swatch-bubble {
        transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s !important;
      }
      .cute-swatch-bubble:hover {
        transform: scale(1.22) !important;
        z-index: 5;
      }
      .cute-swatch-bubble:active {
        transform: scale(0.95) !important;
      }
    `;

export default function NotebookStyles() {
  return <style>{NOTEBOOK_CSS}</style>;
}
