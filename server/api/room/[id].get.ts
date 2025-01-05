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

    let userId = "";

    jwt.verify(token, useRuntimeConfig().jwtSecret, (err, decoded) => {
        if (err) {
            return { code: 401, message: 'Unauthorized' };
        }
        userId = (decoded as jwt.JwtPayload).id;
    });

    const usersDb = useDatabase("users");
    const userResult = await usersDb.sql`SELECT * FROM accounts WHERE id = ${userId}`;
    const userRows = userResult?.rows ?? [];

    if (userRows.length === 0) {
        return { code: 404, message: 'Not Found' };
    }

    const user = userRows[0];
    const secret = useRuntimeConfig().jwtSecret;
    let decoded;
    try {
        decoded = jwt.verify(token, secret);
    } catch (err) {
        console.error(err);
        return { code: 403, message: 'Forbidden' };
    }

    // need to check if the user is allowed to view this match
    const unlockResult = await usersDb.sql`SELECT * FROM unlocks WHERE roomId = ${id} AND userId = ${userId}`;
    const unlockRows = unlockResult?.rows ?? [];
    if (unlockRows.length === 0) {
        return { code: 403, message: 'Forbidden' };
    }

    const msgDb = useDatabase("chat");
    const messages = await msgDb.sql`SELECT * FROM messages WHERE roomId = ${id}`;

    if (!messages.rows || messages.rows.length === 0) {
        return { code: 200, messages: [] };
    }
    // format the messages to: { sender: { id: string, name: string }, content: string, createdAt: string }
    messages.rows = messages.rows?.map((msg: any) => {
        return {
            sender: { id: msg.userId, name: msg.username },
            content: msg.message,
            createdAt: msg.createdAt
        };
    });

    return { code: 200, messages: messages.rows };
});