
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  const authHeader =
    req.headers.get("Authorization") || "";

  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return Response.json(
      { error: "Sign-in required" },
      { status: 401, headers: corsHeaders }
    );
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: userData, error: userError } =
    await userClient.auth.getUser(token);

  if (userError || !userData.user) {
    return Response.json(
      { error: "Invalid session" },
      { status: 401, headers: corsHeaders }
    );
  }

  const adminClient = createClient(url, serviceKey);

  const { data: admin, error: adminError } =
    await adminClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

  if (adminError || !admin) {
    return Response.json(
      { error: "Admin access required" },
      { status: 403, headers: corsHeaders }
    );
  }

  let body: { action?: string } = {};

  try {
    body = await req.json();
  } catch {
    // Empty body
  }

  if (body.action !== "status") {
    return Response.json(
      { error: "Unsupported action" },
      { status: 400, headers: corsHeaders }
    );
  }

  return Response.json(
    {
      status: "ok",
      service: "SACHI admin backend",
      checkedAt: new Date().toISOString(),
    },
    { headers: corsHeaders }
  );
});
