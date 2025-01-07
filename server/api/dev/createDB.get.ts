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
    if (table === 'accounts') { // users
        await db.sql`DROP TABLE IF EXISTS accounts`;
        await db.sql`CREATE TABLE IF NOT EXISTS accounts ("id" TEXT PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "email" TEXT NOT NULL, "role" TEXT DEFAULT "0", "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "accounts" created');
    } else if (table === 'rooms') { // chat
        await db.sql`DROP TABLE IF EXISTS rooms`;
        await db.sql`CREATE TABLE IF NOT EXISTS rooms ("id" TEXT PRIMARY KEY, "views" INTEGER DEFAULT 0, "discoveredBy" TEXT NOT NULL, "discoveredAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "rooms" created');
    } else if (table === 'messages') { // chat
        await db.sql`DROP TABLE IF EXISTS messages`;
        await db.sql`CREATE TABLE IF NOT EXISTS messages ("id" TEXT PRIMARY KEY, "roomId" TEXT NOT NULL, "userId" TEXT NOT NULL, "username" TEXT NOT NULL, "message" TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "messages" created');
    } else if (table === 'unlocks') { // users
        await db.sql`DROP TABLE IF EXISTS unlocks`;
        await db.sql`CREATE TABLE IF NOT EXISTS unlocks ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "roomId" TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "unlocks" created');
    } else if (table === 'leaderboard') {
        await db.sql`DROP TABLE IF EXISTS leaderboard`; // users
        await db.sql`CREATE TABLE IF NOT EXISTS leaderboard ("id" TEXT PRIMARY KEY, "mostMessages" TEXT, "mostDiscoveredRooms" TEXT, "mostJoinedRooms" TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        return new Response('Table "leaderboard" created');
    }
});