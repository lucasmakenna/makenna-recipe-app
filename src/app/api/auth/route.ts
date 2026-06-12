import { NextRequest, NextResponse } from 'next/server';

// Checks a submitted PIN against the admin/view PINs and returns the
// resulting access role. Admin PIN grants both view and edit access.
export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (pin && pin === process.env.ADMIN_PIN) {
    return NextResponse.json({ role: 'admin' });
  }
  if (pin && pin === process.env.VIEW_PIN) {
    return NextResponse.json({ role: 'view' });
  }
  return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
}
