'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="adm-login-wrap">
      <form onSubmit={onSubmit} className="adm-login-card">
        <img src="/seal.svg" alt="Namma Combat" className="adm-login-seal" />
        <img src="/logo.svg" alt="Namma Combat" className="adm-login-logo" />
        <p className="adm-login-subtitle">Admin · Sign in to continue.</p>

        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="adm-input"
            />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="adm-input"
            />
          </div>

          {error && <p className="adm-error">{error}</p>}

          <button type="submit" disabled={submitting} className="adm-btn" style={{ width: '100%' }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
