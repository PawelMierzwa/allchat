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
    // need to check if the user is allowed to view this match
    const unlockResult = await usersDb.sql`SELECT * FROM unlocks WHERE roomId = ${id} AND userId = ${userId}`;
    const unlockRows = unlockResult?.rows ?? [];
    if (unlockRows.length === 0) {
        return { code: 403, message: 'Forbidden' };
    }

    const msgDb = useDatabase("chat");
    const messages = await msgDb.sql`SELECT * FROM messages WHERE roomId = ${id}`;

    // get the room discoverer
    const roomQuery = await msgDb.sql`SELECT * FROM rooms WHERE id = ${id}`;
    const roomRows = roomQuery?.rows ?? [];
    if (roomRows.length === 0) {
        return { code: 404, message: 'Not Found' };
    }

    const room = roomRows[0];
    const roomDiscoverer = room.discoveredBy;
    const discoveredAt = room.discoveredAt;
    const discovererQuery = await usersDb.sql`SELECT * FROM accounts WHERE id = ${roomDiscoverer as string}`;
    const discovererRows = discovererQuery?.rows ?? [];
    
    let discovererName = "???";
    if (discovererRows.length === 0) {
        discovererName = "you";
    } else {
        discovererName = discovererRows[0].username as string;
    }

    if (!messages.rows || messages.rows.length === 0) {
        return { code: 200, messages: [], discover: { username: discovererName, discoveredAt: discoveredAt } };
    }
    // format the messages to: { sender: { id: string, name: string }, content: string, createdAt: string }
    messages.rows = messages.rows?.map((msg: any) => {
        return {
            id: msg.id,
            sender: { id: msg.userId, name: msg.username },
            content: msg.message,
            createdAt: msg.createdAt,

            iv: msg.iv
        };
    });

    return { code: 200, messages: messages.rows, discover: { username: discovererName, discoveredAt: discoveredAt } };
});