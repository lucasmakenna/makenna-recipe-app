'use client';

const KEY = 'mk-recipe-admin-pin';

export function getStoredPin(): string {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(KEY) ?? '';
}

export function setStoredPin(pin: string) {
  window.sessionStorage.setItem(KEY, pin);
}

export function clearStoredPin() {
  window.sessionStorage.removeItem(KEY);
}
