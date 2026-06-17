export function renderSessionSidebar(sessions, currentSessionId, onSessionSelect, onSessionDelete) {
    const container = document.getElementById('sessionSidebarList');
    if (!container) return;
    
    if (!sessions || sessions.length === 0) {
        container.innerHTML = '<div style="padding: 12px; font-size: 12px; color: #666;">No sessions yet</div>';
        return;
    }
    
    container.innerHTML = sessions.map(session => `
        <div class="session-item ${currentSessionId === session.session_id ? 'active' : ''}" 
             data-session-id="${session.session_id}"
             style="padding: 10px 12px; margin: 2px 0; border-radius: 8px; cursor: pointer; position: relative;
                    background: ${currentSessionId === session.session_id ? 'rgba(212,160,0,0.15)' : 'transparent'};
                    border-left: ${currentSessionId === session.session_id ? '3px solid #d4a000' : '3px solid transparent'};">
            <div style="font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 20px;">
                ${escapeHtml(session.title)}
            </div>
            <div style="font-size: 10px; color: #888; margin-top: 4px;">
                ${new Date(session.last_active_at).toLocaleDateString()} · ${session.message_count} msgs
            </div>
            <button class="delete-session-btn" data-session-id="${session.session_id}" 
                    style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                           background: none; border: none; color: #ef4444; cursor: pointer; 
                           font-size: 14px; opacity: 0; transition: opacity 0.2s;">
                🗑️
            </button>
        </div>
    `).join('');
    
    // Add hover effect for delete button
    document.querySelectorAll('.session-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const btn = el.querySelector('.delete-session-btn');
            if (btn) btn.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            const btn = el.querySelector('.delete-session-btn');
            if (btn) btn.style.opacity = '0';
        });
    });
    
    // Add click handlers for session selection
    document.querySelectorAll('.session-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-session-btn')) return;
            const sessionId = el.dataset.sessionId;
            if (onSessionSelect) onSessionSelect(sessionId);
        });
    });
    
    // Add click handlers for delete buttons
    document.querySelectorAll('.delete-session-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sessionId = btn.dataset.sessionId;
            if (confirm('Delete this session? This cannot be undone.')) {
                if (onSessionDelete) onSessionDelete(sessionId);
            }
        });
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}