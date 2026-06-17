// src/js/sessions/supabase-session-manager.js
// Uses the singleton Supabase client from supabase.js

import { supabase } from '../supabase.js';

console.log('[Session Manager] Using singleton Supabase client');

// ── Internal: normalise a raw Supabase session row ──────────────────────
function normaliseSession(row) {
    if (!row) return null;
    return {
        sessionId:   row.session_id || row.sessionId || row.id,
        session_id:  row.session_id || row.sessionId || row.id,
        title:       row.title || 'Study Session',
        courseId:    row.course_id  || row.courseId  || null,
        mode:        row.mode        || 'learn',
        guidanceTool:row.guidance_tool || row.guidanceTool || null,
        createdAt:   row.created_at  || row.createdAt,
        lastActiveAt:row.last_active_at || row.lastActiveAt,
        messageCount:row.message_count  || row.messageCount || 0,
        messages:    row.messages || [],
    };
}

// ── Internal: normalise a raw message row ───────────────────────────────
function normaliseMessage(row) {
    return {
        id:         row.id,
        role:       row.role,
        content:    row.content || '',
        visualCode: row.visual_code || row.visualCode || null,
        createdAt:  row.created_at,
    };
}

// ============================================
// CREATE SESSION
// ============================================
export async function createSession(courseId = null, mode = 'learn', guidanceTool = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate a UUID for session_id
    const sessionId = crypto.randomUUID ? crypto.randomUUID() : 
                     'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                         const r = Math.random() * 16 | 0;
                         const v = c === 'x' ? r : (r & 0x3 | 0x8);
                         return v.toString(16);
                     });

    const title = `Study Session ${new Date().toLocaleDateString('en-GB')}`;

    console.log('[Session] Creating session with ID:', sessionId);

    const { data, error } = await supabase
        .from('user_sessions')
        .insert({
            session_id: sessionId,
            user_id:    user.id,
            course_id:  courseId || null,
            title,
            mode,
            guidance_tool: guidanceTool || null,
        })
        .select()
        .single();

    if (error) {
        console.error('[Session] createSession error:', error.message);
        console.error('[Session] Error details:', error.details);
        throw error;
    }

    console.log('[Session] Session created successfully:', sessionId);
    const session = normaliseSession(data);
    session.messages = [];
    return session;
}

// ============================================
// GET SESSION (with messages)
// ============================================
export async function getSession(sessionId) {
    if (!sessionId) return null;

    const { data: row, error: sErr } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

    if (sErr || !row) {
        console.warn('[Session] getSession not found:', sessionId, sErr?.message);
        return null;
    }

    const { data: msgs, error: mErr } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (mErr) {
        console.warn('[Session] getSession messages error:', mErr.message);
    }

    const session = normaliseSession(row);
    session.messages = (msgs || []).map(normaliseMessage);
    return session;
}

// ============================================
// GET OR CREATE CURRENT SESSION
// ============================================
export async function getOrCreateCurrentSession(courseId = null, mode = 'learn', guidanceTool = null, forceNew = false) {
    if (forceNew) return createSession(courseId, mode, guidanceTool);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false })
        .limit(1);

    if (courseId) query = query.eq('course_id', courseId);

    const { data: rows } = await query;

    if (rows && rows.length > 0) {
        const session = await getSession(rows[0].session_id);
        if (session) return session;
    }

    return createSession(courseId, mode, guidanceTool);
}

// ============================================
// SAVE MESSAGE
// ============================================
export async function saveMessage(
    sessionId,
    role,
    content,
    visualCode = null
) {

    if (!sessionId) {
        console.warn('[Session] saveMessage: no sessionId');
        return null;
    }

    // Normalize role values
    const roleMap = {
        bot: 'assistant',
        ai: 'assistant',
        model: 'assistant',
        teacher: 'assistant',
        human: 'user'
    };

    role = roleMap[role] || role;

    // Allowed DB roles
    const allowedRoles = [
        'user',
        'assistant',
        'system'
    ];

    // Prevent invalid inserts
    if (!allowedRoles.includes(role)) {

        console.error(
            '[Session] Invalid role:',
            role
        );

        role = 'user';
    }

    console.log(
        '[Session] Saving message:',
        {
            sessionId,
            role
        }
    );

    const { data, error } = await supabase
        .from('session_messages')
        .insert({
            session_id: sessionId,
            role,
            content: content || '',
            visual_code: visualCode || null,
        })
        .select()
        .single();

    if (error) {

        console.error(
            '[Session] saveMessage error:',
            error.message,
            '| role:',
            role,
            '| session:',
            sessionId
        );

        return null;
    }

    // Update session activity timestamp
    await supabase
        .from('user_sessions')
        .update({
            last_active_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

    return normaliseMessage(data);
}

// ============================================
// UPDATE SESSION TITLE
// ============================================
export async function updateSessionTitle(sessionId, title) {
    if (!sessionId || !title) return;

    const { error } = await supabase
        .from('user_sessions')
        .update({ title: title.substring(0, 100) })
        .eq('session_id', sessionId);

    if (error) console.warn('[Session] updateSessionTitle error:', error.message);
}

// ============================================
// GET RECENT SESSIONS
// ============================================
export async function getRecentSessions(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: rows, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false })
        .limit(limit);

    if (error || !rows) return [];

    const enriched = await Promise.all(rows.map(async (row) => {
        const { count } = await supabase
            .from('session_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', row.session_id);

        const s = normaliseSession(row);
        s.messageCount  = count || 0;
        s.message_count = count || 0;
        return s;
    }));

    return enriched;
}

// ============================================
// GET SESSIONS BY COURSE
// ============================================
export async function getSessionsByCourse(courseId) {
    if (!courseId) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: rows, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('last_active_at', { ascending: false });

    if (error || !rows) return [];

    const enriched = await Promise.all(rows.map(async (row) => {
        const { count } = await supabase
            .from('session_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', row.session_id);

        const s = normaliseSession(row);
        s.messageCount  = count || 0;
        s.message_count = count || 0;
        return s;
    }));

    return enriched;
}

// ============================================
// DELETE SESSION
// ============================================
export async function deleteSession(sessionId) {
    if (!sessionId) return;
    await supabase.from('session_messages').delete().eq('session_id', sessionId);
    await supabase.from('user_sessions').delete().eq('session_id', sessionId);
}

// ============================================
// DEFAULT EXPORT
// ============================================
export default {
    createSession,
    getSession,
    getOrCreateCurrentSession,
    saveMessage,
    updateSessionTitle,
    getRecentSessions,
    getSessionsByCourse,
    deleteSession
};