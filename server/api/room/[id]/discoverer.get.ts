import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const usersDb = useDatabase("users");
    const msgDb = useDatabase("chat");
    const id = getRouterParam(event, 'id');
    if (!id) {
        return { code: 400, message: 'Invalid room ID' };
    }

    // check if the user is authorized to view this match
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
    const unlockResult = await usersDb.sql`SELECT * FROM unlocks WHERE roomId = ${id} AND userId = ${userId}`;
    const unlockRows = unlockResult?.rows ?? [];
    if (unlockRows.length === 0) {
        return { code: 403, message: 'Forbidden' };
    }

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

    return { code: 200, discover: { username: discovererName, discoveredAt: discoveredAt } };
});