'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Coffee, Settings, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getStoredPin } from '@/lib/admin-pin';
import AccessGate from '@/components/AccessGate';
import type { Recipe, AccessRole } from '@/types';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <AccessGate requiredRole="view">
      {(role) => <HomeInner role={role} />}
    </AccessGate>
  );
}

function HomeInner({ role }: { role: AccessRole }) {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('recipes')
      .select('*')
      .order('drink', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setRecipes(data as Recipe[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    if (!recipes) return [];
    return Array.from(new Set(recipes.map((r) => r.category || 'Uncategorized'))).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    if (!recipes) return [];
    const q = search.trim().toLowerCase();
    const matches = recipes.filter((r) => {
      if (role !== 'admin' && r.hidden) return false;
      if (category !== 'all' && (r.category || 'Uncategorized') !== category) return false;
      if (!q) return true;
      return r.drink.toLowerCase().includes(q) || r.recipe.toLowerCase().includes(q);
    });

    if (!q) return matches;

    // When searching, prioritize matches in the drink name over matches that
    // only appear in the recipe/ingredients, so e.g. "cookie" surfaces the
    // "Cookie Butter Latte" before recipes that merely list "cookie" as an
    // ingredient. Within each group, keep alphabetical order.
    return [...matches].sort((a, b) => {
      const aName = a.drink.toLowerCase().includes(q) ? 0 : 1;
      const bName = b.drink.toLowerCase().includes(q) ? 0 : 1;
      if (aName !== bName) return aName - bName;
      return a.drink.localeCompare(b.drink);
    });
  }, [recipes, search, category, role]);

  async function toggleHidden(r: Recipe) {
    const res = await fetch('/api/recipes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': getStoredPin() },
      body: JSON.stringify({ id: r.id, hidden: !r.hidden }),
    });
    if (res.ok) {
      setRecipes((prev) => prev?.map((x) => (x.id === r.id ? { ...x, hidden: !r.hidden } : x)) ?? prev);
    }
  }

  // Letters that actually have recipes, for the A-Z jump column
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    for (const r of filtered) {
      const ch = r.drink.trim()[0]?.toUpperCase() ?? '';
      set.add(/[A-Z]/.test(ch) ? ch : '#');
    }
    return set;
  }, [filtered]);

  function jumpTo(letter: string) {
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  // Lets users drag a finger up/down the A-Z column (like the iOS Contacts
  // index) instead of having to precisely tap each tiny letter.
  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const letter = target?.getAttribute('data-letter');
    if (letter && availableLetters.has(letter)) jumpTo(letter);
  }

  const ALPHABET = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  let lastLetter = '';

  return (
    <main className="min-h-screen bg-cyan-50/40">
      <div className="tri-stripe" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink-700">Makenna Recipes</h1>
            <p className="mt-1 text-sm text-ink-500">
              {recipes ? `${recipes.length} recipes` : 'Loading…'}
            </p>
          </div>
          {role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-white"
            >
              <Settings size={16} /> Edit recipes
            </Link>
          )}
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by drink name or ingredient..."
              className="input w-full pl-9 text-base"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input sm:w-56"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="card p-4 text-sm text-hibiscus-500">
            Couldn&apos;t load recipes: {error}
            <br />
            Make sure the Supabase <code>recipes</code> table exists and has been seeded — see{' '}
            <Link href="/admin" className="underline">Edit recipes</Link>.
          </div>
        )}

        {recipes && recipes.length === 0 && !error && (
          <div className="card p-8 text-center text-ink-400">
            <Coffee size={32} className="mx-auto mb-3 text-ink-200" />
            <p className="font-semibold text-ink-600">No recipes yet</p>
            <p className="mt-1 text-sm">
              Go to <Link href="/admin" className="text-cyan-500 underline">Edit recipes</Link> and click
              &quot;Import from Mela&quot; to load all 387 recipes.
            </p>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((r) => {
            const ch = r.drink.trim()[0]?.toUpperCase() ?? '';
            const letter = /[A-Z]/.test(ch) ? ch : '#';
            const showHeader = letter !== lastLetter;
            lastLetter = letter;
            return (
              <div key={r.id} className="contents">
                {showHeader && (
                  <div
                    id={`letter-${letter}`}
                    className="col-span-full mt-2 px-1 text-xs font-bold uppercase tracking-wide text-cyan-500"
                  >
                    {letter}
                  </div>
                )}
                <Link
                  href={`/recipe/${r.id}`}
                  className={`card flex items-center justify-between gap-3 p-4 transition hover:shadow-md hover:border-cyan-300 ${r.hidden ? 'opacity-50' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink-700">
                      {r.drink} {r.hidden && <span className="ml-1 text-xs font-normal text-hibiscus-500">(hidden)</span>}
                    </div>
                    <div className="truncate text-xs text-ink-400">{r.category || 'Uncategorized'}</div>
                  </div>
                  {role === 'admin' && (
                    <button
                      onClick={(e) => { e.preventDefault(); toggleHidden(r); }}
                      title={r.hidden ? 'Unhide' : 'Hide'}
                      className="shrink-0 text-ink-300 hover:text-cyan-500"
                    >
                      {r.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {recipes && recipes.length > 0 && filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink-400">No recipes match your search.</p>
        )}
      </div>

      {/* A-Z jump column — fixed full-height strip, tap or drag to scrub */}
      {recipes && recipes.length > 0 && (
        <div
          onPointerDown={handlePointer}
          onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          className="fixed right-0 top-16 bottom-0 z-10 flex w-7 touch-none flex-col items-center justify-between rounded-l-lg bg-white/80 py-2 shadow-md backdrop-blur select-none"
        >
          {ALPHABET.map((letter) => {
            const active = availableLetters.has(letter);
            return (
              <div
                key={letter}
                data-letter={letter}
                className={`flex w-full flex-1 items-center justify-center text-[10px] font-bold leading-none ${
                  active ? 'text-cyan-600' : 'text-ink-200'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
