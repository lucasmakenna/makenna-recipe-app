'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '@/types';

export default function RecipeDetail() {
  const params = useParams();
  const id = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRecipe((data as Recipe) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-cyan-50/40">
      <div className="tri-stripe" />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700">
          <ArrowLeft size={16} /> All recipes
        </Link>

        {recipe === undefined && <p className="text-ink-400">Loading…</p>}
        {recipe === null && <p className="text-ink-400">Recipe not found.</p>}

        {recipe && (
          <div className="card p-6">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-500">
              {recipe.category || 'Uncategorized'}
            </div>
            <h1 className="mb-4 text-2xl font-bold text-ink-700">{recipe.drink}</h1>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-600">
              {recipe.recipe}
            </pre>
            <div className="mt-6">
              <Link
                href={`/admin/${recipe.id}`}
                className="text-xs font-semibold text-cyan-500 hover:underline"
              >
                Edit this recipe
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
