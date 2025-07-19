import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.json();
  const { subject, sender, recipient, date, department, file_url, created_by } = body;
  const registry_number = `REG-${Date.now()}`;

  const { data, error } = await supabase
    .from("correspondence")
    .insert([{
      subject, sender, recipient, date, department,
      registry_number, file_url, created_by,
    }]);

  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify({ data }), { status: 200 });
});
