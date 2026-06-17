// supabase/functions/fapshi-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get the webhook payload from Fapshi
        const body = await req.json();
        console.log("[fapshi-webhook] Received:", JSON.stringify(body));

        const { transId, status, userId, externalId, amount } = body;

        // Only process successful payments
        if (status === "SUCCESSFUL" || status === "success") {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

            let userIdToUpgrade = userId;
            if (!userIdToUpgrade && externalId) {
                const ccMatch = externalId.match(/^cc-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-\d+$/i);
                if (ccMatch) {
                    userIdToUpgrade = ccMatch[1];
                } else if (externalId.startsWith("cheatcode-")) {
                    const parts = externalId.split("-");
                    userIdToUpgrade = parts.slice(1, 6).join("-");
                }
            }

            if (userIdToUpgrade) {
                // Update user to paid status
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({
                        status: "paid",
                        query_limit: 999999,
                        queries_today: 0,
                        paid_at: new Date().toISOString(),
                        trial_end: null
                    })
                    .eq("id", userIdToUpgrade);

                if (updateError) {
                    console.error("[fapshi-webhook] Update error:", updateError);
                    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
                }

                // Record the payment
                await supabase.from("payments").insert({
                    user_id: userIdToUpgrade,
                    amount_xaf: amount || 4500,
                    amount_usd: 7.99,
                    method: "fapshi",
                    transaction_id: transId,
                    status: "successful",
                    confirmed_at: new Date().toISOString(),
                });

                console.log(`[fapshi-webhook] User ${userIdToUpgrade} upgraded to Pro`);
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            }
        }

        return new Response(JSON.stringify({ success: true, message: "Webhook processed" }), { headers: corsHeaders });

    } catch (error) {
        console.error("[fapshi-webhook] Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});