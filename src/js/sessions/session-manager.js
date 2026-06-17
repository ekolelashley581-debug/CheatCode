// src/js/sessions/session-manager.js
import { supabase } from '../supabase.js';

// Generate unique session ID
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Create a new session
// In session-manager.js, modify createSession function
export async function createSession(courseId = null, mode = 'learn') {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No authenticated user found');
            return null;
        }
        
        const sessionId = generateSessionId();
        const title = `Study Session ${new Date().toLocaleDateString()}`;
        
        const { data, error } = await supabase
            .from('study_sessions')
            .insert({
                session_id: sessionId,
                user_id: user.id,  // Make sure this is included
                title: title,
                course_id: courseId,
                mode: mode,
                message_count: 0
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error creating session:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error creating session:', error);
        return null;
    }
}

// Get last 10 sessions for current user
export async function getRecentSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error('Error loading sessions:', error);
        return [];
    }
    return data || [];
}

// Get a session with all its messages
export async function getSession(sessionId) {
    const { data: session, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
    
    if (sessionError) {
        console.error('Error loading session:', sessionError);
        return null;
    }
    
    const { data: messages, error: messagesError } = await supabase
        .from('study_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
    
    if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return { ...session, messages: [] };
    }
    
    return { ...session, messages: messages || [] };
}

// Save a message to a session
export async function saveMessage(sessionId, role, content, visualCode = null) {
    const { data, error } = await supabase
        .from('study_messages')
        .insert({
            session_id: sessionId,
            role: role,
            content: content,
            visual_code: visualCode
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error saving message:', error);
        return null;
    }
    
    // Update message count
    await supabase.rpc('increment_message_count', { session_id_param: sessionId });
    
    return data;
}

// Update session title
export async function updateSessionTitle(sessionId, title) {
    const { error } = await supabase
        .from('study_sessions')
        .update({ title: title })
        .eq('session_id', sessionId);
    
    if (error) {
        console.error('Error updating session title:', error);
    }
}

// Delete a session
export async function deleteSession(sessionId) {
    const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('session_id', sessionId);
    
    if (error) {
        console.error('Error deleting session:', error);
        return false;
    }
    return true;
}

// Get or create current session (resume last or start new)
export async function getOrCreateCurrentSession(courseId = null, mode = 'learn') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Get most recent session from today
    const today = new Date().toDateString();
    const { data: recent } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false })
        .limit(1);
    
    const lastSession = recent?.[0];
    const lastSessionDate = lastSession ? new Date(lastSession.last_active_at).toDateString() : null;
    
    if (lastSession && lastSessionDate === today && lastSession.message_count > 0) {
        return await getSession(lastSession.session_id);
    }
    
    // Create new session
    const newSession = await createSession(courseId, mode);
    return await getSession(newSession.session_id);
}

// Add this function to session-manager.js
export async function cleanupOldSessions(daysOld = 30) {
    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        
        const { data: oldSessions } = await supabase
            .from('study_sessions')
            .select('session_id')
            .lt('last_active_at', cutoff.toISOString());
        
        if (oldSessions && oldSessions.length > 0) {
            for (const session of oldSessions) {
                await deleteSession(session.session_id);
            }
            console.log(`Cleaned up ${oldSessions.length} old sessions`);
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// Call cleanup occasionally (e.g., when app loads)
// Add to init function in app.js