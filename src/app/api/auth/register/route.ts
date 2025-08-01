console.log("✅ Backend přijal request");

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  console.log("✅ Došel POST request");

  const { email, password } = await req.json();
  console.log("📩 Získaná data:", email, password);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log("✅ Supabase OK:", data);
  return NextResponse.json({ message: 'Registrace OK', data });
}
