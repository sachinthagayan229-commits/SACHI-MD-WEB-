
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://sachinthagayan229-commits.github.io"
];

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function response(
  data: unknown,
  status: number,
  headers: Record<string, string>
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json"
    }
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method !== "POST") {
    return response(
      { error: "Method not allowed" },
      405,
      headers
    );
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return response(
      { error: "Origin not allowed" },
      403,
      headers
    );
  }

  try {
    const authHeader =
      req.headers.get("Authorization") || "";

    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return response(
        { error: "Authentication required" },
        401,
        headers
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return response(
        { error: "Backend environment is incomplete" },
        500,
        headers
      );
    }

    // Verify signed-in user
    const userClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const {
      data: userData,
      error: userError
    } = await userClient.auth.getUser(token);

    if (userError || !userData.user) {
      return response(
        { error: "Invalid session" },
        401,
        headers
      );
    }

    // Verify admin permission on server
    const adminClient = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const {
      data: admin,
      error: adminError
    } = await adminClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      return response(
        { error: "Admin permission required" },
        403,
        headers
      );
    }

    let body: { action?: string } = {};

    try {
      body = await req.json();
    } catch {
      return response(
        { error: "Invalid request body" },
        400,
        headers
      );
    }

    if (body.action !== "status") {
      return response(
        { error: "Unknown action" },
        400,
        headers
      );
    }

    return response(
      {
        status: "ok",
        service: "SACHI-MD-WEB Admin Backend",
        checkedAt: new Date().toISOString()
      },
      200,
      headers
    );

  } catch {
    return response(
      { error: "Internal server error" },
      500,
      headers
    );
  }
});
