'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '../lib/supabase-browser';

type Status = 'idle' | 'submitting' | 'error';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (error) {
      setStatus('error');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <label>
        Email
        <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Signing in…' : 'Sign in'}
      </button>
      {status === 'error' && <p className="error" role="alert">Wrong email or password.</p>}
    </form>
  );
}
