'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

export default function LoginPage() {
  const { isAuthenticated, login, loginAsDemo } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/studio');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace('/studio');
    } catch {
      setError('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    router.replace('/studio');
  };

  if (isAuthenticated) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f0f9ff 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg viewBox="0 0 28 28" fill="none" style={{ width: 28, height: 28 }}>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Welcome to Rancage</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '8px 0 0' }}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6c5ce7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,92,231,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6c5ce7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,92,231,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ padding: '10px 0', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ position: 'relative', margin: '24px 0' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#e5e7eb' }} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{ background: '#fff', padding: '0 12px', fontSize: 12, color: '#9ca3af' }}>OR</span>
          </div>
        </div>

        <button
          onClick={handleDemo}
          style={{ width: '100%', padding: '10px 0', background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          Try Demo Mode
        </button>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20 }}>
          Demo mode requires no account. Data stays in your browser.
        </p>
      </div>
    </div>
  );
}
