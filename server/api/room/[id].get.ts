import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        return { code: 400, message: 'Invalid game ID' };
    }

    // check if the user is authorized to view this match
    const token = getCookie(event, 'token');
    if (!token) {
        return { code: 401, message: 'Unauthorized' };
    }
    // verify if user has access

    const db = useDatabase();
    const result = await db.sql`SELECT * FROM rooms WHERE id = ${id}`;
    const rows = result?.rows ?? [];

    if (rows.length === 0) {
        return { code: 404, message: 'Not Found' };
    }

    const match = rows[0];
    const secret = useRuntimeConfig().jwtSecret;
    let decoded;
    try {
        decoded = jwt.verify(token, secret);
    } catch (err) {
        console.error(err);
        return { code: 403, message: 'Forbidden' };
    }

    // need to check if the user is allowed to view this match
    if ((match.allowedUsers as String).includes((decoded as jwt.JwtPayload).id)) {
        return { code: 200, message: match };
    } else {
        console.error('User not allowed');
        return { code: 403, message: 'Forbidden' };
    }
});