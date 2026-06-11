import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function checkPin(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  return pin && pin === process.env.ADMIN_PIN;
}

// Create a new recipe
export async function POST(req: NextRequest) {
  if (!checkPin(req)) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  const body = await req.json();
  const { drink, category, recipe } = body;
  if (!drink) return NextResponse.json({ error: 'Drink name required' }, { status: 400 });

  const { data, error } = await adminClient()
    .from('recipes')
    .insert({ drink, category: category ?? '', recipe: recipe ?? '' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recipe: data });
}

// Update an existing recipe
export async function PUT(req: NextRequest) {
  if (!checkPin(req)) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  const body = await req.json();
  const { id, drink, category, recipe } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data, error } = await adminClient()
    .from('recipes')
    .update({ drink, category, recipe, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recipe: data });
}

// Delete a recipe
export async function DELETE(req: NextRequest) {
  if (!checkPin(req)) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await adminClient().from('recipes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
