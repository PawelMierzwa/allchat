export default defineEventHandler(async (event) => {
    const db = useDatabase();
    const changenotes = await db.sql`SELECT notes FROM changenotes ORDER BY id DESC`;
    
    return { changenotes };
});