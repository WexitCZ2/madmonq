import { supabase } from '@/lib/supabaseClient';
import { } from 'next/server';

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '*';

  try {
    const { email, password } = await req.json();
    console.log("🔐 Přihlašování:", email);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("❌ Login chyba:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json"
        }
      });
    }

    console.log("✅ Login OK:", data);

    return new Response(JSON.stringify({
      message: "Login OK",
      session: {
        access_token: data.session.access_token,
        user: {
          id: data.session.user.id, // ✅ Přidáváme ID
          email: data.session.user.email
        }
      }
    }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      }
    });

  } catch (err: unknown) {
    console.error("❌ Server chyba:", err);
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
