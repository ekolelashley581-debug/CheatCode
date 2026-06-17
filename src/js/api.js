// src/js/api.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export const MODELS = {
    free: 'google/gemini-2.0-flash-exp:free',
    mini: 'openai/gpt-4o-mini',
    haiku: 'anthropic/claude-3.5-haiku',
    sonnet: 'anthropic/claude-3.5-sonnet',
};

// ============================================
// SYSTEM PROMPTS - Each mode has distinct personality
// ============================================

const MODE_PROMPTS = {
    learn: `You are CheatCode, a patient, thorough teacher.

RULES:
- NEVER show raw code. NEVER show LaTeX source. Show formulas visually.
- Explain concepts deeply with real-world examples.
- Break down complex ideas step by step.
- Ask clarifying questions when needed.
- End each response with a short "Key Takeaway".
- Use analogies that relate to the student's experience.
- Be encouraging and supportive.`,

    practice: `You are CheatCode Practice Mode.

RULES:
- Generate ONE practice problem at a time.
- Wait for the student's answer before revealing the solution.
- When student answers, tell them if correct or not.
- If incorrect, explain WHY and show the correct method.
- Categorize errors: sign convention, conceptual, procedural, unit conversion.
- After solving, offer another practice problem.`,

    quick: `You are CheatCode Quick Mode.

RULES:
- Give the shortest possible answer that is still correct.
- Maximum 3 sentences for definitions.
- Use bullet points for lists (max 5 items).
- No examples unless asked.
- No extra explanations.
- Get straight to the point.`,

    urgent: `You are CheatCode Urgent Mode. The student has an exam very soon.

RULES:
- Focus ONLY on high-yield topics (80% of exam material).
- Give direct, actionable advice.
- Point out common traps and mistakes.
- Prioritize what to study first.
- Be calm but direct. No fluff.
- Include memory tricks or mnemonics when helpful.`
};

const GUIDANCE_PROMPTS = {
    deconstruct: `Break this concept into 5-8 atomic pieces. List EVERY prerequisite. For each piece, ask "Do you understand this?" Then teach ONLY the missing pieces. Rebuild the full concept from what they know.`,

    analogy: `Provide 4 analogies for this concept:
1. Physical/mechanical analogy
2. Everyday life analogy  
3. Visual/spatial analogy
4. Systems analogy
For each, explain where it works AND where it breaks down.`,

    firstprinciples: `Derive this concept from absolute basics. Every single step, no jumps. Start from fundamental truths. Explain WHY each step works, not just HOW. Use minimal assumptions.`,

    socratic: `Do NOT explain anything. Only ask questions. Start with a foundational question. Based on answer, ask a deeper question. Continue until finding the boundary. When stuck, briefly teach that specific gap, then resume questioning.`,

    visualize: `You are a visualization generator. Generate ONLY a COMPLETE, self-contained HTML visualization.

CRITICAL RULES:
1. Return ONLY the HTML code inside a single \`\`\`html code block.
2. NO explanations before or after the code.
3. NO markdown formatting outside the code block.
4. The HTML must work standalone when opened in a browser.

TECHNICAL REQUIREMENTS:
- Load Chart.js from CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
- Wait for DOM content to load using: document.addEventListener('DOMContentLoaded', function() { ... })
- Define chart data BEFORE creating the chart.
- Include error handling for missing elements.
- Use dark background (#07070f) and gold accent (#d4a000).
- Make it interactive with sliders if applicable.

EXAMPLE STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: #07070f; color: #e8e8f0; font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        canvas { max-width: 600px; max-height: 400px; background: #fff; border-radius: 8px; }
        .controls { margin-top: 20px; display: flex; gap: 20px; align-items: center; }
        label { color: #d4a000; }
        input { cursor: pointer; }
    </style>
</head>
<body>
    <canvas id="myChart"></canvas>
    <div class="controls">
        <label>Frequency: <input type="range" id="freqSlider" min="1" max="10" step="0.1" value="5"></label>
        <span id="freqValue">5.0 Hz</span>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const canvas = document.getElementById('myChart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let chart = null;
            
            function generateData(freq) {
                const labels = [];
                const data = [];
                for (let x = 0; x <= 10; x += 0.2) {
                    labels.push(x.toFixed(1));
                    data.push(Math.sin(2 * Math.PI * freq * x / 10));
                }
                return { labels, data };
            }
            
            function updateChart(freq) {
                const { labels, data } = generateData(freq);
                if (chart) chart.destroy();
                chart = new Chart(ctx, {
                    type: 'line',
                    data: { labels: labels, datasets: [{ label: 'y = sin(2πft)', data: data, borderColor: '#d4a000', backgroundColor: 'rgba(212,160,0,0.1)', borderWidth: 2, fill: true }] },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#e8e8f0' } } }, scales: { x: { ticks: { color: '#e8e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#e8e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
                });
            }
            
            const slider = document.getElementById('freqSlider');
            const valueSpan = document.getElementById('freqValue');
            if (slider) {
                const initialFreq = parseFloat(slider.value);
                updateChart(initialFreq);
                valueSpan.textContent = initialFreq.toFixed(1) + ' Hz';
                slider.addEventListener('input', function() {
                    const freq = parseFloat(this.value);
                    valueSpan.textContent = freq.toFixed(1) + ' Hz';
                    updateChart(freq);
                });
            }
        });
    </script>
</body>
</html>
\`\`\`

IMPORTANT: Do NOT write any text outside the code block. Return ONLY the HTML.`,

    testme: `Generate a quiz question based on the material. Provide 4 options (A, B, C, D). Wait for answer before revealing correct answer and explanation. Track what the student gets wrong.`
};

export function getSystemPrompt(mode, guidanceTool) {
    if (guidanceTool && GUIDANCE_PROMPTS[guidanceTool]) {
        return GUIDANCE_PROMPTS[guidanceTool];
    }
    return MODE_PROMPTS[mode] || MODE_PROMPTS.learn;
}

export function selectModel(message, mode, guidanceTool, isPro = false) {
    if (!isPro) return MODELS.mini;
    if (guidanceTool === 'visualize') return MODELS.haiku;
    if (mode === 'quick') return MODELS.mini;
    if (mode === 'urgent') return MODELS.haiku;
    return MODELS.haiku;
}

export async function callAI(messages, options = {}) {
    const {
        mode = 'learn',
        guidanceTool = null,
        isPro = false,
        temperature = 0.3,
        maxTokens = 2000,
    } = options;

    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const model = selectModel(lastUserMsg, mode, guidanceTool, isPro);
    const systemPrompt = getSystemPrompt(mode, guidanceTool);

    const allMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CheatCode',
        },
        body: JSON.stringify({
            model,
            messages: allMessages,
            temperature,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Clean content - remove code blocks and LaTeX source for non-visualize modes
    let cleanContent = content;
    
    if (guidanceTool !== 'visualize') {
        // Remove HTML code blocks
        cleanContent = cleanContent.replace(/```html[\s\S]*?```/g, '[Interactive visualization generated]');
        // Remove other code blocks
        cleanContent = cleanContent.replace(/```[\s\S]*?```/g, '');
    }

    return {
        content: cleanContent,
        model,
        cost: 0,
    };
}

export async function analyzeImage(base64Image) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CheatCode',
        },
        body: JSON.stringify({
            model: MODELS.mini,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this image thoroughly. Extract all text, describe all charts, graphs, and diagrams. Include all numbers, labels, and values visible.' },
                        { type: 'image_url', image_url: { url: base64Image } },
                    ],
                },
            ],
            temperature: 0.2,
            max_tokens: 1500,
        }),
    });

    const data = await response.json();
    return {
        content: data.choices?.[0]?.message?.content || '',
        model: MODELS.mini,
        cost: 0,
    };
}

// src/js/app.js - Add this once (not in dashboard)

// ============================================================
// GLOBAL KEYBOARD SHORTCUTS (added once, not per render)
// ============================================================
document.addEventListener('keydown', function globalKeyHandler(e) {
    // Ctrl+Shift+S → Study
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (state.user) {
            navigateTo('study');
        }
    }
    
    // Ctrl+Shift+L → Library
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        if (state.user) {
            navigateTo('library');
        }
    }
    
    // Ctrl+Shift+A → Admin
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (sessionStorage.getItem('cc_role') === 'admin') {
            navigateTo('admin');
        } else if (state.user) {
            navigateTo('admin-login');
        } else {
            navigateTo('signin');
        }
    }
});

export { supabase };