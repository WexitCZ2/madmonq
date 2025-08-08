import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '*';

  try {
    const { email, password, name } = await req.json();
    console.log("📩 Registrace:", email, name);

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

    // 🔥 Uložit jméno do tabulky profiles (upsert = vloží nebo aktualizuje)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ email, name });

    if (profileError) {
      console.error("❌ Chyba při ukládání do profiles:", profileError.message);
    }

    console.log("✅ Registrace OK");
    return new Response(JSON.stringify({ message: 'Registrace OK', data }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      }
    });

  } catch (err: unknown) {
    console.error("❌ Serverová chyba:", err);
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
