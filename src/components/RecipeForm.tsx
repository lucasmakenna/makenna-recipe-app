'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredPin } from '@/lib/admin-pin';
import type { Recipe } from '@/types';

export default function RecipeForm({ recipe }: { recipe?: Recipe }) {
  const router = useRouter();
  const [drink, setDrink] = useState(recipe?.drink ?? '');
  const [category, setCategory] = useState(recipe?.category ?? '');
  const [body, setBody] = useState(recipe?.recipe ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr('');

    const res = await fetch('/api/recipes', {
      method: recipe ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': getStoredPin() },
      body: JSON.stringify({ id: recipe?.id, drink, category, recipe: body }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setErr(data.error ?? 'Failed to save.');
      return;
    }
    router.push(`/recipe/${data.recipe.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink-600">Drink name</label>
        <input value={drink} onChange={(e) => setDrink(e.target.value)} required className="input w-full" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink-600">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Supreme Iced"
          className="input w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink-600">Recipe</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="input w-full font-mono text-xs leading-relaxed"
        />
      </div>
      {err && <p className="text-sm text-hibiscus-500">{err}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-cyan flex-1">
          {saving ? 'Saving…' : 'Save recipe'}
        </button>
      </div>
    </form>
  );
}
