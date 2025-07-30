import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email } = body;

  console.log("Přijato z Webflow:", name, email);

  const response = NextResponse.json({
    message: `Nazdar ${name}, tvůj email je ${email}`
  });

  // Přidání CORS hlaviček
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}

// CORS preflight (pro Webflow)
export function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
