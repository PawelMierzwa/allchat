export default defineEventHandler(async (event) => {
    // Create users table
    const query = getQuery(event);
    const database = query.db;
    const table = query.table;
    const db = useDatabase(database as string);
    if (!db) {
        return { code: 500, message: 'Database not available', status: 'error' };
    }
    if (!table) {
        return { code: 400, message: 'Table not specified', status: 'error' };
    }
    if (table === 'users') {
        await db.sql`DROP TABLE IF EXISTS users`;
        await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "email" TEXT NOT NULL, "role" TEXT DEFAULT "0", "rating" INTEGER default 1000 NOT NULL, "ratingDeviation" REAL DEFAULT 350 NOT NULL, "ratingVolatility" REAL DEFAULT 0.06 NOT NULL, "status" TEXT, "locale" TEXT DEFAULT "en" NOT NULL, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "users" created');
    } else if (table === 'matches') {
        await db.sql`DROP TABLE IF EXISTS matches`;
        await db.sql`CREATE TABLE IF NOT EXISTS matches ("id" TEXT PRIMARY KEY,"modeId" INTEGER, "allowedUsers" TEXT, "spectatorsAllowed" BOOLEAN, "chatHistory" TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "ongoing" BOOLEAN DEFAULT TRUE)`;
        return new Response('Table "matches" created');
    } else if (table === 'queue') {
        await db.sql`DROP TABLE IF EXISTS queue`;
        await db.sql`CREATE TABLE IF NOT EXISTS queue (
        "id" TEXT PRIMARY KEY,
        "modeId" INTEGER,
        "userId" TEXT,
        "rating" INTEGER,
        "locale" TEXT,
        "priority" NUMBER DEFAULT 0,
        "startedOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        // increment priority every X seconds
        return new Response('Table "queue" created');
    }
});