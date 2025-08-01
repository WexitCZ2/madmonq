import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  console.log("✅ Backend přijal request");

  const origin = req.headers.get('origin') || '*';

  try {
    const { email, password } = await req.json();
    console.log("📩 Email:", email, "| Password:", password);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("❌ Supabase chyba:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json"
        }
      });
    }

    console.log("✅ Supabase registrace OK:", data);
    return new Response(JSON.stringify({ message: 'Registrace OK', data }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      }
    });

  } catch (err: any) {
    console.error("❌ Serverová chyba:", err.message || err);
    return new Response(JSON.stringify({ error: "Chyba při zpracování požadavku" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
