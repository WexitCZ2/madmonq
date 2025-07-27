import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, time } = body;

  const { error } = await supabase.from('bookings').insert([{ name, time }]);

  if (error) {
    console.error(error);
    return NextResponse.json({ message: 'Chyba při ukládání' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Rezervace uložena!' });
}
