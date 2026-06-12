'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AccessGate from '@/components/AccessGate';
import RecipeForm from '@/components/RecipeForm';

export default function NewRecipePage() {
  return (
    <AccessGate requiredRole="admin">
      {() => (
        <main className="min-h-screen bg-cyan-50/40">
          <div className="tri-stripe" />
          <div className="mx-auto max-w-2xl px-4 py-8">
            <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700">
              <ArrowLeft size={16} /> Recipe editor
            </Link>
            <h1 className="mb-4 text-2xl font-bold text-ink-700">Add recipe</h1>
            <RecipeForm />
          </div>
        </main>
      )}
    </AccessGate>
  );
}
