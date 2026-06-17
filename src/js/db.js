// Shared IndexedDB schema for Library + Study.
// v4 restores textbooks/files stores that study.js previously dropped at v3.

const Dexie = window.Dexie;

export const db = new Dexie('CheatCodeDB');

const FULL_STORES = {
    courses:          '++id, code, name, lecturer, examDate',
    topics:           '++id, courseId, name, masteryLevel',
    materials:        '++id, courseId, topicId, type, title, content, dateAdded',
    files:            '++id, courseId, name, type, size, data, dateAdded',
    textbooks:        '++id, courseId, title, totalPages, chapters, rawText, dateAdded',
    learningSessions: '++id, courseId, materialId, timestamp, questionsAsked',
};

db.version(1).stores(FULL_STORES);

// Some installs were upgraded to v3 with only the courses store (study.js bug).
db.version(3).stores({
    courses: FULL_STORES.courses,
});

db.version(4).stores(FULL_STORES);

db.open().catch(err => console.warn('[DB] open warning:', err));
