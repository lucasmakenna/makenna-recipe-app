'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { getStoredPin, getStoredRole, setStoredAccess } from '@/lib/admin-pin';
import { AccessRole } from '@/types';

/**
 * PIN gate with two access levels:
 *  - 'view'  — store iPads / general staff. VIEW_PIN or ADMIN_PIN both work.
 *  - 'admin' — trainers/managers. Only ADMIN_PIN works. Grants edit/hide/delete.
 *
 * Resolved role is checked against `requiredRole` and passed to children via
 * a render-prop so pages can branch their UI (e.g. show hide/unhide toggles
 * only for admins).
 */
export default function AccessGate({
  requiredRole,
  children,
}: {
  requiredRole: AccessRole;
  children: (role: AccessRole) => React.ReactNode;
}) {
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<AccessRole | null>(null);
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedRole = getStoredRole();
    const storedPin = getStoredPin();
    if (storedRole && storedPin) {
      setRole(storedRole);
      setPin(storedPin);
    }
    setReady(true);
  }, []);

  async function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setErr('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    setChecking(false);
    if (!res.ok) {
      setErr('Incorrect PIN.');
      return;
    }
    const { role: resolvedRole } = await res.json();
    setStoredAccess(pin, resolvedRole);
    setRole(resolvedRole);
  }

  if (!ready) return null;

  const allowed = role === 'admin' || (role === 'view' && requiredRole === 'view');

  if (allowed && role) return <>{children(role)}</>;

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <Lock size={28} className="mx-auto mb-3 text-ink-300" />
      <h1 className="mb-1 text-xl font-bold text-ink-700">
        {requiredRole === 'admin' ? 'Recipe editor' : 'Makenna Koffee Recipes'}
      </h1>
      <p className="mb-4 text-sm text-ink-400">
        {requiredRole === 'admin'
          ? 'Enter the trainer/manager PIN to make changes.'
          : 'Enter your store PIN to view recipes.'}
      </p>
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
