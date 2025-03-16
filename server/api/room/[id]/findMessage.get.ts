import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const db = useDatabase("chat");
    const usersDb = useDatabase("users");
    const roomId = getRouterParam(event, 'id');

    if (!roomId) {
        return { code: 400, message: 'Invalid room ID' };
    }

    const token = getCookie(event, 'token');
    if (!token) {
        return { code: 401, message: 'Unauthorized' };
    }

    let userId = "";

    jwt.verify(token, useRuntimeConfig().jwtSecret, (err, decoded) => {
        if (err) {
            return;
        }
        userId = (decoded as jwt.JwtPayload).id;
    });

    if (!userId) {
        return { code: 401, message: 'Unauthorized' };
    }

    console.log(`User ${userId} is trying to find a message in room ${roomId}`);

    const unlockResult = await usersDb.sql`SELECT * FROM unlocks WHERE roomId = ${roomId} AND userId = ${userId}`;
    const unlockRows = unlockResult?.rows ?? [];
    if (unlockRows.length === 0) {
        return { code: 403, message: 'Forbidden' };
    }

    const messageId = query.msg as string;
    const message = await db.sql`SELECT * FROM messages WHERE roomId = ${roomId} AND id = ${messageId}`;
    if (!message?.rows || message.rows.length === 0) {
        return { code: 404, message: 'Message not found' };
    }

    const searchedMessage = message.rows[0];
    const formattedMessage = {
        id: searchedMessage.id,
        sender: { id: searchedMessage.userId, name: searchedMessage.username },
        content: searchedMessage.message,
        createdAt: searchedMessage.createdAt,
        iv: searchedMessage.iv
    }
    return { code: 200, searchedMsg: formattedMessage };
});