'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '40px auto' }}>
          <h1 style={{ fontSize: 22 }}>Something went wrong.</h1>
          <p style={{ color: '#555' }}>The error has been reported. Please refresh, or go back and try again.</p>
          {error?.digest && <p style={{ color: '#888', fontSize: 12 }}>Reference: {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
