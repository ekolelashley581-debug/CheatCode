// supabase/functions/ai-chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Verify auth
        const authHeader = req.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "").trim();
        if (!token) {
            return new Response(JSON.stringify({ error: "Missing auth token" }), { status: 401, headers: corsHeaders });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) {
            return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
        }

        // Parse request
        const { messages, mode, guidanceTool, isPro, temperature, max_tokens } = await req.json();

        // System prompts
        const systemPrompt = getSystemPrompt(mode, guidanceTool);

        // Call OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_KEY}`,
                "HTTP-Referer": "https://cheatcode.app",
                "X-Title": "CheatCode",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "system", content: systemPrompt }, ...messages],
                temperature: temperature || 0.3,
                max_tokens: max_tokens || 2000,
            }),
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});

function getSystemPrompt(mode: string, guidanceTool: string | null): string {
    if (guidanceTool === 'visualize') {
        return `You are a visualization generator. Generate a COMPLETE, self-contained HTML visualization. Return ONLY the HTML code inside a \`\`\`html code block. Use dark background (#07070f) and gold accent (#d4a000).`;
    }
    
    const prompts: Record<string, string> = {
        learn: "You are CheatCode, a patient teacher. Explain concepts deeply with examples. End with a 'Key Takeaway'.",
        practice: "Generate ONE practice problem. Wait for answer. Then explain the solution.",
        quick: "Give concise, short answers. Maximum 3 sentences.",
        urgent: "Exam-focused. Give high-yield topics and common traps."
    };
    
    return prompts[mode] || prompts.learn;
}