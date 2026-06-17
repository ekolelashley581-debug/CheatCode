// supabase/functions/fapshi-pay/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FAPSHI_KEY = Deno.env.get("FAPSHI_API_KEY") || "";
const FAPSHI_USER = Deno.env.get("FAPSHI_API_USER") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Use sandbox for testing, change to https://live.fapshi.com for production
const FAPSHI_BASE = "https://live.fapshi.com";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    try {
        // Verify auth token
        const authHeader = req.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "").trim();
        if (!token) {
            return new Response(JSON.stringify({ error: "Missing auth token" }), {
                status: 401,
                headers: { ...CORS, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SRK);
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) {
            return new Response(JSON.stringify({ error: "Invalid token" }), {
                status: 401,
                headers: { ...CORS, "Content-Type": "application/json" },
            });
        }

        // Parse request body
        const body = await req.json();
        const { action, phone, amount, userId, email, externalId, transId } = body;

        if (!action) {
            return new Response(JSON.stringify({ error: "Missing action" }), {
                status: 400,
                headers: { ...CORS, "Content-Type": "application/json" },
            });
        }

        if (userId !== user.id) {
            return new Response(JSON.stringify({ error: "User mismatch" }), {
                status: 403,
                headers: { ...CORS, "Content-Type": "application/json" },
            });
        }

        // Route to appropriate action
        if (action === "initiate") {
            return await initiatePayment({ phone, amount, userId, email, externalId });
        }

        if (action === "status") {
            return await checkStatus(transId);
        }

        return new Response(JSON.stringify({ error: "Unknown action" }), {
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("[fapshi-pay] Error:", err);
        return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
            status: 500,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }
});

async function initiatePayment(p: {
    phone: string;
    amount: number;
    userId: string;
    email: string;
    externalId: string;
}) {
    if (!p.phone) {
        return new Response(JSON.stringify({ error: "Phone number required" }), {
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    if (!p.amount) {
        return new Response(JSON.stringify({ error: "Amount required" }), {
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    // Clean phone number
    const cleaned = p.phone.replace(/\D/g, "");
    if (cleaned.length < 9) {
        return new Response(JSON.stringify({ error: "Invalid phone number" }), {
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    const payload = {
        amount: p.amount,
        phone: cleaned,
        externalId: p.externalId || `cc-${p.userId}-${Date.now()}`,
        message: "CheatCode Pro Access",
        redirectUrl: "https://cheatcode.app/#payment",
    };

    if (p.email) payload.email = p.email;

    console.log("[fapshi-pay] Initiating payment for:", cleaned);

    try {
        const resp = await fetch(`${FAPSHI_BASE}/initiate-pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apiuser": FAPSHI_USER,
                "apikey": FAPSHI_KEY,
            },
            body: JSON.stringify(payload),
        });

        const data = await resp.json();

        if (!resp.ok) {
            return new Response(JSON.stringify({ error: data.message || data.error || "Fapshi error" }), {
                status: 502,
                headers: { ...CORS, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...CORS, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Connection to Fapshi failed" }), {
            status: 502,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }
}

async function checkStatus(transId: string) {
    if (!transId) {
        return new Response(JSON.stringify({ error: "Transaction ID required" }), {
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    try {
        const resp = await fetch(`${FAPSHI_BASE}/payment-status/${transId}`, {
            headers: {
                "apiuser": FAPSHI_USER,
                "apikey": FAPSHI_KEY,
            },
        });

        const data = await resp.json();

        if (!resp.ok) {
            return new Response(JSON.stringify({ error: data.message || "Status check failed" }), {
                status: 502,
                headers: { ...CORS, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...CORS, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Status check failed" }), {
            status: 502,
            headers: { ...CORS, "Content-Type": "application/json" },
        });
    }
}