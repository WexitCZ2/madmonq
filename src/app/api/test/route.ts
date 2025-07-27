// backend/src/app/api/test/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email } = body;

  console.log("Přijato z Webflow:", name, email);

  return NextResponse.json({ message: `Nazdar ${name}, tvůj email je ${email}` });
}
