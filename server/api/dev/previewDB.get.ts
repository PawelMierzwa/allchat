export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const table = query.table;
    const database = query.db;
    const db = useDatabase(database as string);
    setResponseStatus(event, 200, "Success")
    if (table === 'matches') {
        return db.sql`SELECT * FROM matches`;
    } else if (table === 'users') {
        return db.sql`SELECT * FROM users`;
    } else if (table === 'queue') {
        return db.sql`SELECT * FROM queue`;
    }
    // list all tables of the default database 
    return db.sql`SELECT name FROM sqlite_master WHERE type='table'`;
});