'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Coffee, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types';

export const dynamic = 'force-dynamic';

export default function Home() {
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
    return recipes.filter((r) => {
      if (category !== 'all' && (r.category || 'Uncategorized') !== category) return false;
      if (!q) return true;
      return r.drink.toLowerCase().includes(q) || r.recipe.toLowerCase().includes(q);
    });
  }, [recipes, search, category]);

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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-white"
          >
            <Settings size={16} /> Edit recipes
          </Link>
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
                  className="card flex items-center justify-between gap-3 p-4 transition hover:shadow-md hover:border-cyan-300"
                >
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink-700">{r.drink}</div>
                    <div className="truncate text-xs text-ink-400">{r.category || 'Uncategorized'}</div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {recipes && recipes.length > 0 && filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink-400">No recipes match your search.</p>
        )}
      </div>

      {/* A-Z jump column */}
      {recipes && recipes.length > 0 && (
        <div className="fixed right-1 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-[2px] rounded-full bg-white/80 px-1 py-2 shadow-md backdrop-blur">
          {ALPHABET.map((letter) => {
            const active = availableLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => active && jumpTo(letter)}
                disabled={!active}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold leading-none transition ${
                  active ? 'text-cyan-600 hover:bg-cyan-100' : 'text-ink-200'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
