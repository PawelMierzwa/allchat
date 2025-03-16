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
    const query = getQuery(event);
    let messages = null;
    let hasMore = false;
    let discover = false;
    let discovererName = "";
    let discoveredAt = "";

    if (query.limit && !query.context) {
        // get the last n messages
        messages = await msgDb.sql`SELECT * FROM messages WHERE roomId = ${id} ORDER BY createdAt DESC LIMIT ${Number(query.limit) + 1}`;
        if (messages.rows && messages.rows.length > Number(query.limit)) {
            hasMore = true;
            messages.rows = messages.rows.slice(0, Number(query.limit));
        }
    } else if (query.limit && query.context) {
        const limit = Number(query.limit);
        // get the next n messages before the context
        messages = await msgDb.sql`SELECT * FROM messages WHERE roomId = ${id} AND createdAt < ${String(query.context)} ORDER BY createdAt DESC LIMIT ${limit + 1}`;

        if (messages.rows && messages.rows.length > limit) {
            hasMore = true;
            messages.rows = messages.rows.slice(0, limit);
        }
    } else {
        // last 50 messages and discoverer info
        messages = await msgDb.sql`SELECT * FROM messages WHERE roomId = ${id} ORDER BY createdAt DESC LIMIT 26`;
        if (messages.rows && messages.rows.length > 25) {
            hasMore = true;
            messages.rows = messages.rows.slice(0, 25);
        }

        // get the room discoverer
        const roomQuery = await msgDb.sql`SELECT * FROM rooms WHERE id = ${id}`;
        const roomRows = roomQuery?.rows ?? [];
        if (roomRows.length === 0) {
            return { code: 404, message: 'Not Found' };
        }

        const room = roomRows[0];

        discover = true;
        const roomDiscoverer = room.discoveredBy;
        discoveredAt = room.discoveredAt as string;
        const discovererQuery = await usersDb.sql`SELECT * FROM accounts WHERE id = ${roomDiscoverer as string}`;
        const discovererRows = discovererQuery?.rows ?? [];

        
        if (discovererRows.length === 0) {
            discovererName = "you";
        } else {
            discovererName = discovererRows[0].username as string;
        }
    }

    if (!messages.rows || messages.rows.length === 0) {
        return { code: 200, messages: [], hasMore: false };
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

    if (discover) {
        return { code: 200, messages: messages.rows, discover: { username: discovererName, discoveredAt: discoveredAt } };
    }
    return { code: 200, messages: messages.rows, hasMore };
});