import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import seedData from '@/data/recipes-seed.json';

// One-time seed: imports the 387 recipes from the Mela export into the
// Supabase `recipes` table. Gated by ADMIN_PIN. Safe to call once;
// re-running will skip any drink names already in the table.
export async function POST(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  if (!pin || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: existing, error: existingErr } = await admin.from('recipes').select('drink');
  if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 500 });

  const existingNames = new Set((existing ?? []).map((r) => r.drink.toLowerCase()));

  type SeedRow = { drink: string; recipe: string; mela_category: string };
  const rows = (seedData as SeedRow[])
    .filter((r) => !existingNames.has(r.drink.toLowerCase()))
    .map((r) => ({
      drink: r.drink,
      category: (r.mela_category || '').split('\n')[0] || 'Uncategorized',
      recipe: r.recipe,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ inserted: 0, message: 'Already seeded.' });
  }

  const { error } = await admin.from('recipes').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ inserted: rows.length });
}
