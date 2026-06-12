'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AccessGate from '@/components/AccessGate';
import RecipeForm from '@/components/RecipeForm';
import type { Recipe } from '@/types';

export const dynamic = 'force-dynamic';

function EditInner() {
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
        <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700">
          <ArrowLeft size={16} /> Recipe editor
        </Link>
        <h1 className="mb-4 text-2xl font-bold text-ink-700">Edit recipe</h1>
        {recipe === undefined && <p className="text-ink-400">Loading…</p>}
        {recipe === null && <p className="text-ink-400">Recipe not found.</p>}
        {recipe && <RecipeForm recipe={recipe} />}
      </div>
    </main>
  );
}

export default function EditRecipePage() {
  return (
    <AccessGate requiredRole="admin">
      {() => <EditInner />}
    </AccessGate>
  );
}
