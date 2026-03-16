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

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim();
  const surname = String(body.surname || body.lastName || "").trim();
  const roleToAssign = "admin";

  if (!email || !password || !firstName || !surname) {
    return new Response(JSON.stringify({ error: "All fields are required." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      surname,
      role: roleToAssign
    },
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

  const { error: adminError } = await supabaseAdmin
    .from("User_admins")
    .insert({
      firstname: firstName,
      surname,
      email,
      role: roleToAssign
    });

  if (adminError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return new Response(JSON.stringify({ error: adminError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ userId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
