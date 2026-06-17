// src/js/sessions/local-session-manager.js

// Use a simple, unique database name
const DB_NAME = 'AppDatabase';
const db = new Dexie(DB_NAME);

// Define ALL tables in version 1
db.version(1).stores({
    courses: '++id, code, name, lecturer, examDate',
    topics: '++id, courseId, name, masteryLevel',
    materials: '++id, courseId, topicId, type, title, content, dateAdded',
    files: '++id, courseId, name, type, size, data, dateAdded',
    textbooks: '++id, courseId, title, totalPages, chapters, rawText, dateAdded',
    learningSessions: '++id, courseId, materialId, timestamp, questionsAsked',
    sessions: '++id, sessionId, title, courseId, mode, guidanceTool, createdAt, lastActiveAt, messageCount, duration',
    messages: '++id, sessionId, role, content, visualCode, createdAt'
});

// Initialize database
let dbInitialized = false;
let initPromise = null;

async function initDB() {
    if (dbInitialized) return true;
    if (initPromise) return initPromise;
    
    initPromise = (async () => {
        try {
            await db.open();
            dbInitialized = true;
            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            // Try to delete and recreate
            await indexedDB.deleteDatabase(DB_NAME);
            await db.open();
            dbInitialized = true;
            return true;
        }
    })();
    
    return initPromise;
}

function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function createLocalSession(courseId = null, mode = 'learn', guidanceTool = null) {
    await initDB();
    const sessionId = generateSessionId();
    const title = `Study Session ${new Date().toLocaleDateString()}`;
    const now = new Date().toISOString();
    
    const session = {
        sessionId, title,
        courseId: courseId ? Number(courseId) : null,
        mode, guidanceTool,
        messageCount: 0, duration: 0,
        createdAt: now, lastActiveAt: now
    };
    
    const id = await db.sessions.add(session);
    return { ...session, id, messages: [] };
}

export async function getRecentSessions(limit = 10) {
    await initDB();
    try {
        return await db.sessions.orderBy('lastActiveAt').reverse().limit(limit).toArray();
    } catch { return []; }
}

export async function getSessionsByCourse(courseId) {
    await initDB();
    try {
        return await db.sessions.where('courseId').equals(Number(courseId)).toArray();
    } catch { return []; }
}

export async function getSession(sessionId) {
    await initDB();
    try {
        const session = await db.sessions.where('sessionId').equals(sessionId).first();
        if (!session) return null;
        const messages = await db.messages.where('sessionId').equals(sessionId).sortBy('createdAt');
        return { ...session, messages: messages || [] };
    } catch { return null; }
}

export async function saveMessage(sessionId, role, content, visualCode = null) {
    await initDB();
    const message = {
        sessionId, role, content, visualCode,
        createdAt: new Date().toISOString()
    };
    const id = await db.messages.add(message);
    
    const session = await db.sessions.where('sessionId').equals(sessionId).first();
    if (session?.id) {
        await db.sessions.update(session.id, {
            messageCount: (session.messageCount || 0) + 1,
            lastActiveAt: new Date().toISOString()
        });
    }
    return { ...message, id };
}

export async function updateSessionTitle(sessionId, title) {
    await initDB();
    const session = await db.sessions.where('sessionId').equals(sessionId).first();
    if (session?.id) await db.sessions.update(session.id, { title });
}

export async function deleteSession(sessionId) {
    await initDB();
    const session = await db.sessions.where('sessionId').equals(sessionId).first();
    if (session?.id) {
        await db.sessions.delete(session.id);
        await db.messages.where('sessionId').equals(sessionId).delete();
    }
}

export async function getOrCreateCurrentSession(courseId = null, mode = 'learn', guidanceTool = null, forceNew = false) {
    await initDB();
    
    if (forceNew) {
        return await createLocalSession(courseId, mode, guidanceTool);
    }
    
    try {
        const today = new Date().toDateString();
        let sessions = await db.sessions.toArray();
        if (courseId) {
            sessions = sessions.filter(s => s.courseId === Number(courseId));
        }
        const todaySession = sessions.find(s => {
            if (!s?.lastActiveAt) return false;
            return new Date(s.lastActiveAt).toDateString() === today && (s.messageCount || 0) > 0;
        });
        
        if (todaySession) {
            const fullSession = await getSession(todaySession.sessionId);
            if (fullSession) return fullSession;
        }
    } catch {}
    
    return await createLocalSession(courseId, mode, guidanceTool);
}

export async function clearAllSessions() {
    await initDB();
    await db.sessions.clear();
    await db.messages.clear();
}