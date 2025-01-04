export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const table = query.table;
    let database = query.db;
    if (!database) {
        database = "users";
    }
    const db = useDatabase(database as string);
    setResponseStatus(event, 200, "Success")
    if (table === 'rooms') {
        return db.sql`SELECT * FROM rooms`;
    } else if (table === 'accounts') {
        return db.sql`SELECT * FROM accounts`;
    } else if (table === 'messages') {
        return db.sql`SELECT * FROM messages`;
    }
    // list all tables of the default database 
    return db.sql`SELECT name FROM sqlite_master WHERE type='table'`;
});