export default defineEventHandler(async (event) => {
    const db = useDatabase('chat');
    const changenotes = await db.sql`SELECT notes FROM changenotes ORDER BY id DESC`;
    
    return { changenotes };
});