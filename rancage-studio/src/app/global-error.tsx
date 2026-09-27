'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ maxWidth: 480, padding: 32, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            !
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={reset}
            style={{ padding: '8px 20px', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
