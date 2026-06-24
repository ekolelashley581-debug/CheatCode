// src/js/pages/privacy.js
export function renderPrivacyPage(state, _supabase, navigateTo) {
    const page = document.getElementById('page-privacy');
    if (!page) return;

    page.innerHTML = `
        <style>
            .policy-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
                color: var(--text, #e8e8f0);
            }
            .policy-container h1 {
                font-size: 28px;
                color: var(--gold, #d4a000);
                margin-bottom: 8px;
            }
            .policy-container .last-updated {
                color: var(--text3, #666);
                font-size: 13px;
                margin-bottom: 32px;
            }
            .policy-container h2 {
                font-size: 18px;
                color: var(--gold, #d4a000);
                margin-top: 28px;
                margin-bottom: 12px;
            }
            .policy-container p {
                font-size: 14px;
                line-height: 1.7;
                color: var(--text2, #aaa);
                margin-bottom: 12px;
            }
            .policy-container ul {
                padding-left: 24px;
                margin-bottom: 16px;
            }
            .policy-container li {
                font-size: 14px;
                line-height: 1.7;
                color: var(--text2, #aaa);
                margin-bottom: 6px;
            }
            .policy-container .back-link {
                color: var(--gold, #d4a000);
                text-decoration: none;
                display: inline-block;
                margin-bottom: 24px;
                font-size: 14px;
            }
            .policy-container .back-link:hover {
                text-decoration: underline;
            }
            .policy-divider {
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                margin: 24px 0;
            }
            @media (max-width: 600px) {
                .policy-container { padding: 24px 16px; }
                .policy-container h1 { font-size: 22px; }
                .policy-container h2 { font-size: 16px; }
            }
        </style>

        <div class="policy-container">
            <a href="#" class="back-link" id="backLink">← Back</a>
            <h1>Privacy Policy</h1>
            <p class="last-updated">Last updated: June 2026</p>

            <p>CheatCode ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>

            <hr class="policy-divider">

            <h2>1. Information We Collect</h2>
            <p><strong>Personal Information:</strong> When you create an account, we collect your name, email address, and phone number (optional).</p>
            <p><strong>Academic Materials:</strong> You may upload lecture notes, PDFs, images, and other study materials. These are stored securely and are only accessible to you.</p>
            <p><strong>Usage Data:</strong> We collect anonymized usage data to improve the platform.</p>

            <h2>2. How We Use Your Information</h2>
            <ul>
                <li>To provide and improve our AI tutoring services</li>
                <li>To process payments and activations</li>
                <li>To personalize your learning experience</li>
                <li>To send occasional updates (you can opt out)</li>
            </ul>

            <h2>3. Data Storage & Security</h2>
            <ul>
                <li>Your data is stored on secure servers with industry-standard encryption</li>
                <li>Your study materials are private and only accessible to you</li>
                <li>We do not share, sell, or rent your personal data to third parties</li>
            </ul>

            <h2>4. Your Rights</h2>
            <ul>
                <li>You can access, modify, or delete your account at any time</li>
                <li>You can request a copy of your data</li>
                <li>You can opt out of marketing communications</li>
            </ul>

            <h2>5. Third-Party Services</h2>
            <ul>
                <li><strong>Supabase:</strong> Used for authentication and database</li>
                <li><strong>OpenRouter:</strong> Used for AI processing</li>
                <li><strong>Fapshi:</strong> Used for payment processing</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies.</p>

            <h2>7. Children's Privacy</h2>
            <p>CheatCode is not intended for users under 13 years of age. We do not knowingly collect personal information from children.</p>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any material changes via email or through the platform.</p>

            <h2>9. Contact</h2>
            <p>If you have questions about this privacy policy, please contact us at: <a href="mailto:support@cheatcode.app" style="color:var(--gold);">support@cheatcode.app</a></p>
        </div>
    `;

    document.getElementById('backLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard');
    });
}