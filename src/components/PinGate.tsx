'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { getStoredPin, setStoredPin } from '@/lib/admin-pin';

/**
 * Simple shared-PIN gate for the recipe editor. Not real auth — just keeps
 * casual store visitors from editing recipes. The PIN is checked again
 * server-side (against ADMIN_PIN) on every write.
 */
export default function PinGate({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const stored = getStoredPin();
    if (stored) {
      setPin(stored);
      setUnlocked(true);
    }
  }, []);

  async function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setErr('');
    // Verify by hitting the recipes API with a harmless no-op (DELETE with
    // a bogus id) — a 401 means wrong PIN, anything else means it's valid.
    const res = await fetch('/api/recipes?id=__pin_check__', {
      method: 'DELETE',
      headers: { 'x-admin-pin': pin },
    });
    setChecking(false);
    if (res.status === 401) {
      setErr('Incorrect PIN.');
      return;
    }
    setStoredPin(pin);
    setUnlocked(true);
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <Lock size={28} className="mx-auto mb-3 text-ink-300" />
      <h1 className="mb-1 text-xl font-bold text-ink-700">Recipe editor</h1>
      <p className="mb-4 text-sm text-ink-400">Enter the trainer/manager PIN to make changes.</p>
      <form onSubmit={tryUnlock} className="flex gap-2">
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="input flex-1 text-center text-lg tracking-widest"
          autoFocus
        />
        <button type="submit" disabled={checking} className="btn-cyan">
          {checking ? '...' : 'Unlock'}
        </button>
      </form>
      {err && <p className="mt-2 text-sm text-hibiscus-500">{err}</p>}
    </div>
  );
}
