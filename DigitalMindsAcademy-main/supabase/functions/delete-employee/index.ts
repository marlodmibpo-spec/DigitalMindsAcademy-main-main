import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "").trim();
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Missing auth token." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const role =
    authData.user.app_metadata?.role ||
    authData.user.user_metadata?.role ||
    "";
  const isAdminFlag = authData.user.user_metadata?.is_admin === true;
  const isAdmin = role === "admin" || role === "superadmin" || isAdminFlag;

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin access required." }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "").trim();
  const email = String(body.email || "").trim();

  if (!userId && !email) {
    return new Response(JSON.stringify({ error: "userId or email is required." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  let resolvedUserId = userId;

  // If only email is provided, try to find the auth user by email.
  if (!resolvedUserId && email) {
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return new Response(JSON.stringify({ error: `Could not list users to resolve email: ${listError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const match = (listData?.users || []).find((u) =>
      String(u.email || "").toLowerCase() === email.toLowerCase()
    );
    if (match?.id) {
      resolvedUserId = match.id;
    }
  }

  const deleteFilter = resolvedUserId ? { id: resolvedUserId } : { email };
  const responsePayload: Record<string, unknown> = { deletedAuth: false, deletedRow: false };

  // Delete from Auth first so we don't leave an orphaned auth account.
  if (resolvedUserId) {
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(resolvedUserId);
    if (deleteAuthError) {
      return new Response(JSON.stringify({ error: `Auth delete failed: ${deleteAuthError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    responsePayload.deletedAuth = true;
  }

  const { error: deleteRowError } = await supabaseAdmin
    .from("users_employee")
    .delete()
    .match(deleteFilter);

  if (deleteRowError) {
    return new Response(JSON.stringify({ error: `Table delete failed: ${deleteRowError.message}`, ...responsePayload }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  responsePayload.deletedRow = true;

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
