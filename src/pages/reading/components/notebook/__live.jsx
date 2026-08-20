// Dev-only: the whole notebook, running, with no login and no book.
//
// ProNotebook could only ever be exercised inside the reading room, which needs
// an account and a shelf item. That is how a crash shipped twice in one week —
// an icon used without being imported, and a state setter whose declaration was
// deleted while six call sites stayed behind. Both are ReferenceErrors, so the
// build stayed green and the first thing to run the code was a browser
// belonging to someone using the site.
//
// uid is null, so nothing here writes to Firestore or Storage; the notebook
// falls back to local pages.
import React from 'react';
import ProNotebook from '../ProNotebook.jsx';

export default function NotebookLive() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <ProNotebook bookId="dev-preview" uid={null} activeBook={null} />
    </div>
  );
}
