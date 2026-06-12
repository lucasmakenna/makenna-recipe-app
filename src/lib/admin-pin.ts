'use client';

import { AccessRole } from '@/types';

const PIN_KEY = 'mk-recipe-pin';
const ROLE_KEY = 'mk-recipe-role';

export function getStoredPin(): string {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(PIN_KEY) ?? '';
}

export function getStoredRole(): AccessRole | null {
  if (typeof window === 'undefined') return null;
  const role = window.sessionStorage.getItem(ROLE_KEY);
  return role === 'admin' || role === 'view' ? role : null;
}

export function setStoredAccess(pin: string, role: AccessRole) {
  window.sessionStorage.setItem(PIN_KEY, pin);
  window.sessionStorage.setItem(ROLE_KEY, role);
}

export function clearStoredPin() {
  window.sessionStorage.removeItem(PIN_KEY);
  window.sessionStorage.removeItem(ROLE_KEY);
}
