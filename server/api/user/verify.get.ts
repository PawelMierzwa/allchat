import jwt, { JwtPayload } from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'token');
    if (!token) {
        return { code: 401, message: 'Unauthorized', status: 'error' };
    }
    const secret = useRuntimeConfig().jwtSecret;
    let decoded;
    try {
        decoded = jwt.verify(token, secret);
    } catch (err) {
        console.error(err);
        return { code: 403, message: 'Forbidden', status: 'error' };
    }
    const db = useDatabase("users");
    if (!db) {
        return { code: 500, message: 'Database not available', status: 'error' };
    }
    const result = await db.sql`SELECT rooms FROM accounts WHERE id = ${(decoded as JwtPayload).id}`;
    const rows = result?.rows ?? [];
    if (rows.length === 0) {
        return { code: 404, message: 'Player not found', status: 'error' };
    }
    const player = rows[0];
    const room = getQuery(event).room;
    if ((player.rooms as string).split(' ').includes(room as string)) {
        return { code: 200, message: 'Player allowed', status: 'success' };
    }
    return { code: 403, message: 'Forbidden', status: 'success' };
});