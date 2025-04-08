import jwt from 'jsonwebtoken';
import { isVNode } from 'vue';

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

    // need to check if the user is allowed to view this match
    const unlockResult = await usersDb.sql`SELECT * FROM unlocks WHERE roomId = ${roomId} AND userId = ${userId}`;
    const unlockRows = unlockResult?.rows ?? [];
    if (unlockRows.length === 0) {
        return { code: 403, message: 'Forbidden' };
    }

    const messageId = query.msg as string;
    // find the message context (the 5 messages before and 5 after the message)
    const messageContext = await db.sql`SELECT * FROM messages WHERE roomId = ${roomId} AND id = ${messageId}`;
    if (!messageContext?.rows || messageContext.rows.length === 0) {
        return { code: 404, message: 'Message not found' };
    }
    const message = messageContext.rows[0];
    const messageTime = String(message.createdAt);
    const messageSender = {
        id: message.userId,
        username: message.username
    };

    const messageContextQuery = await db.sql`SELECT * FROM messages WHERE roomId = ${roomId} AND createdAt <= ${messageTime} ORDER BY createdAt DESC LIMIT 5`;
    const messageContextRows = messageContextQuery?.rows ?? [];
    const messageContextQuery2 = await db.sql`SELECT * FROM messages WHERE roomId = ${roomId} AND createdAt > ${messageTime} ORDER BY createdAt ASC LIMIT 5`;
    const messageContextRows2 = messageContextQuery2?.rows ?? [];

    messageContextRows.forEach((msg) => {
        msg.id = msg.id;
        msg.sender = { id: msg.userId, username: msg.username };
        msg.createdAt = String(msg.createdAt);
        msg.content = msg.message;
        msg.iv = msg.iv;
    });

    messageContextRows2.forEach((msg) => {
        msg.id = msg.id;
        msg.sender = { id: msg.userId, username: msg.username };
        msg.createdAt = String(msg.createdAt);
        msg.content = msg.message;
        msg.iv = msg.iv;
    });

    const context = {
        message: {
            id: message.id,
            sender: messageSender,
            createdAt: messageTime,
            content: message.message,
            iv: message.iv
        },
        messagesBefore: messageContextRows,
        messagesAfter: messageContextRows2
    };

    console.log('Message context', context);
    

    return { code: 200, context: context };
});