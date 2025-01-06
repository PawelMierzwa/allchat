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
    const result = await db.sql`SELECT id FROM unlocks WHERE userId = ${(decoded as JwtPayload).id} AND roomId = ${getRouterParam(event, 'id')}`;
    const rows = result?.rows ?? [];
    if (rows.length === 0) {
        return { code: 404, message: 'Player not found', status: 'error' };
    } else {
        return { code: 200, message: 'Player allowed', status: 'success' };
    }
});