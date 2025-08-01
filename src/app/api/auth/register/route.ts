export async function POST(req: Request) {
    console.log("✅ Backend přijal request");
  
    const body = await req.json();
    console.log("📦 Body obsahuje:", body);
  
    return new Response(JSON.stringify({
      message: "Backend žije!",
      data: body
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
    