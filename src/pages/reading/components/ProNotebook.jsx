import React from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, color: 'red', wordBreak: 'break-all' }}>{this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

export default function ProNotebook({ bookId, uid }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--br2)', background: 'white' }}>
      <ErrorBoundary>
        <Tldraw 
          persistenceKey={`notebook-${uid}-${bookId}`} 
        />
      </ErrorBoundary>
    </div>
  );
}
