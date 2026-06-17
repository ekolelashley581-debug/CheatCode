import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "").trim();
        if (!token) {
            return new Response(JSON.stringify({ error: "Missing auth token" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) {
            return new Response(JSON.stringify({ error: "Invalid session" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { code } = await req.json();
        const normalized = String(code || "").trim().toUpperCase();
        if (!normalized) {
            return new Response(JSON.stringify({ error: "Activation code required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { data: codeData, error: codeError } = await supabase
            .from("activation_codes")
            .select("*")
            .eq("code", normalized)
            .eq("status", "unused")
            .single();

        if (codeError || !codeData) {
            return new Response(JSON.stringify({ error: "Invalid or already used code" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (codeData.expires_at && new Date() > new Date(codeData.expires_at)) {
            return new Response(JSON.stringify({ error: "This code has expired" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const durationDays = codeData.duration_days || 120;
        const proUntil = new Date();
        proUntil.setDate(proUntil.getDate() + durationDays);

        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                status: "paid",
                query_limit: 999999,
                queries_today: 0,
                paid_at: new Date().toISOString(),
                trial_end: proUntil.toISOString(),
            })
            .eq("id", user.id);

        if (profileError) {
            return new Response(JSON.stringify({ error: profileError.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        await supabase
            .from("activation_codes")
            .update({
                status: "used",
                used_by: user.id,
                used_at: new Date().toISOString(),
            })
            .eq("id", codeData.id);

        return new Response(JSON.stringify({
            success: true,
            duration_days: durationDays,
            pro_until: proUntil.toISOString(),
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
