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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  // Optional: require an authenticated admin user.
  // For now, any authenticated user can call this function.
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

  const role = authData.user.app_metadata?.role || authData.user.user_metadata?.role;
  const isAdminFlag = authData.user.user_metadata?.is_admin === true;
  const isAdmin = role === "admin" || role === "superadmin" || isAdminFlag;

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin access required." }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const roleToAssign = "employee";

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { firstName, lastName },
    app_metadata: { role: roleToAssign }
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const userId = data.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "User creation failed." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const profilePayload = {
    id: userId,
    email,
    firstname: firstName,
    surname: lastName,
    role: roleToAssign
  };

  const { error: profileError } = await supabaseAdmin
    .from("Users_employee")
    .insert(profilePayload);

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ userId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});

 
