'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Download, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getStoredPin } from '@/lib/admin-pin';
import AccessGate from '@/components/AccessGate';
import type { Recipe } from '@/types';

export const dynamic = 'force-dynamic';

function AdminInner() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [search, setSearch] = useState('');

  function reload() {
    supabase
      .from('recipes')
      .select('*')
      .order('drink', { ascending: true })
      .then(({ data }) => setRecipes((data as Recipe[]) ?? []));
  }

  useEffect(reload, []);

  async function runSeed() {
    setSeeding(true);
    setSeedMsg('');
    const res = await fetch('/api/seed', {
      method: 'POST',
      headers: { 'x-admin-pin': getStoredPin() },
    });
    const data = await res.json();
    setSeeding(false);
    if (!res.ok) {
      setSeedMsg(`Error: ${data.error}`);
      return;
    }
    setSeedMsg(
      data.inserted ? `Imported ${data.inserted} recipes.` : (data.message ?? 'Done.'),
    );
    reload();
  }

  async function deleteRecipe(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    const res = await fetch(`/api/recipes?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': getStoredPin() },
    });
    if (res.ok) reload();
    else alert('Failed to delete.');
  }

  async function toggleHidden(r: Recipe) {
    const res = await fetch('/api/recipes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': getStoredPin() },
      body: JSON.stringify({ id: r.id, hidden: !r.hidden }),
    });
    if (res.ok) reload();
    else alert('Failed to update.');
  }

  function exportCsv() {
    const rows = recipes ?? [];
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const header = ['Drink', 'Category', 'Recipe', 'Hidden'];
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [r.drink, r.category || 'Uncategorized', r.recipe, r.hidden ? 'TRUE' : 'FALSE']
          .map(escape)
          .join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makenna-recipes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = (recipes ?? []).filter((r) =>
    r.drink.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-cyan-50/40">
      <div className="tri-stripe" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700">
          <ArrowLeft size={16} /> All recipes
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-700">Recipe editor</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={!recipes?.length}
              className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-white disabled:opacity-50"
            >
              <Download size={16} /> Export CSV
            </button>
            <Link href="/admin/new" className="btn-cyan flex items-center gap-2">
              <Plus size={16} /> Add recipe
            </Link>
          </div>
        </div>

        {recipes && recipes.length === 0 && (
          <div className="card mb-4 p-4">
            <p className="mb-2 text-sm text-ink-600">
              No recipes in the database yet. Import the 387 recipes from the Mela export to get started.
            </p>
            <button onClick={runSeed} disabled={seeding} className="btn-cyan flex items-center gap-2">
              {seeding ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Import from Mela
            </button>
            {seedMsg && <p className="mt-2 text-sm text-ink-500">{seedMsg}</p>}
          </div>
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes to edit..."
          className="input mb-3 w-full"
        />

        <div className="card divide-y divide-ink-100 overflow-hidden">
          {filtered.map((r) => (
            <div key={r.id} className={`flex items-center justify-between gap-3 p-3 ${r.hidden ? 'opacity-50' : ''}`}>
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink-700">
                  {r.drink} {r.hidden && <span className="ml-1 text-xs font-normal text-hibiscus-500">(hidden)</span>}
                </div>
                <div className="truncate text-xs text-ink-400">{r.category || 'Uncategorized'}</div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => toggleHidden(r)}
                  title={r.hidden ? 'Unhide' : 'Hide'}
                  className="text-ink-300 hover:text-cyan-500"
                >
                  {r.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <Link href={`/admin/${r.id}`} className="text-sm font-semibold text-cyan-500 hover:underline">
                  Edit
                </Link>
                <button onClick={() => deleteRecipe(r.id, r.drink)} className="text-ink-300 hover:text-hibiscus-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AccessGate requiredRole="admin">
      {() => <AdminInner />}
    </AccessGate>
  );
}
