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
    if (table === 'accounts') {
        await db.sql`DROP TABLE IF EXISTS accounts`;
        await db.sql`CREATE TABLE IF NOT EXISTS accounts ("id" TEXT PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "email" TEXT NOT NULL, "rooms" TEXT, "role" TEXT DEFAULT "0", "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "accounts" created');
    } else if (table === 'rooms') {
        await db.sql`DROP TABLE IF EXISTS rooms`;
        await db.sql`CREATE TABLE IF NOT EXISTS rooms ("id" TEXT PRIMARY KEY, "views" INTEGER DEFAULT 0, "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "rooms" created');
    } else if (table === 'messages') {
        await db.sql`DROP TABLE IF EXISTS messages`;
        await db.sql`CREATE TABLE IF NOT EXISTS messages ("id" TEXT PRIMARY KEY, "roomId" TEXT NOT NULL, "userId" TEXT NOT NULL, "username" TEXT NOT NULL, "message" TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "messages" created');
    }
});