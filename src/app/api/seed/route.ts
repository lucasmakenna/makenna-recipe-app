import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import seedData from '@/data/recipes-seed.json';

// Full sync: replaces all recipes in Supabase with the seed file.
// Deletes rows not in the seed (handles renames), upserts the rest.
// Safe to re-run after any spreadsheet update. Gated by ADMIN_PIN.
export async function POST(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  type SeedRow = { drink: string; recipe: string; mela_category: string };
  const rows = (seedData as SeedRow[]).map((r) => ({
    drink: r.drink,
    category: (r.mela_category || '').split('\n')[0] || 'Uncategorized',
    recipe: r.recipe,
  }));

  const newTitles = rows.map((r) => r.drink);

  // Delete any rows whose title is no longer in the seed (handles renames)
  const { error: deleteError } = await admin
    .from('recipes')
    .delete()
    .not('drink', 'in', `(${newTitles.map((t) => `"${t}"`).join(',')})`);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const { error } = await admin.from('recipes').upsert(rows, { onConflict: 'drink' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ upserted: rows.length });
}
