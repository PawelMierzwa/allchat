import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    if (!id) {
        return {
            code: 400,
            message: 'Bad Request'
        };
    }
    const token = getCookie(event, 'token') || "";
    if (!token) {
        return {
            code: 401,
            message: 'Unauthorized'
        };
    }
    const query = getQuery(event);
    // there should be only one query parameter, room
    if (Object.keys(query).length !== 0 && !query.room) {
        return {
            code: 400,
            message: 'Bad Request'
        };
    }

    // stats:
    // - total messages in the room
    // - total room views
    // - total unique users in the room who sent messages
    // - discovered date

    // extended stats: (if the user is authorized to view the stats + request query parameter)
    // - total unique users in the room
    // - last message in the room + date
    // - discoverer of the room, user who entered the room first

    // verify if the user is authorized to view stats of the room
    if (query.extended && query.extended === 'true') {
        jwt.verify(token, useRuntimeConfig(event).jwtSecret, async (err, decoded) => {
            if (err) {
                return {
                    code: 401,
                    message: 'Unauthorized'
                };
            } else {
                const db = useDatabase('users');
                const userQueryResult = await db.sql`SELECT rooms FROM accounts WHERE id = ${(decoded as jwt.JwtPayload).id}`;
                const user = userQueryResult.rows ? userQueryResult.rows[0] : null;
                if (!user) {
                    return {
                        code: 401,
                        message: 'Unauthorized'
                    };
                }

                if (!(user.rooms as string).split(" ").includes(query.room as string)) {
                    return {
                        code: 401,
                        message: 'Unauthorized'
                    };
                }
            }
        });
    }

    const db = useDatabase('chat');
    const roomStats = await db.sql`SELECT * FROM rooms WHERE id = ${id}`;
    if (!roomStats.rows || roomStats.rows.length === 0) {
        return {
            code: 404,
            message: 'Not Found'
        };
    }

    const room = roomStats.rows[0];
    // get total messages in the room
    // dont get the messages, just the count
    const messageCountQueryResult = await db.sql`SELECT COUNT(*) FROM messages WHERE roomId = ${id}`;
    const totalMessages = messageCountQueryResult.rows ? messageCountQueryResult.rows[0].count : 0;

    const totalViews = room.views;

    // get unique users in the room
    const uniqueMsgSendersQueryResult = await db.sql`SELECT DISTINCT userId FROM messages WHERE roomId = ${id}`;
    const totalUniqueMessageSenders = uniqueMsgSendersQueryResult.rows ? uniqueMsgSendersQueryResult.rows.length : 0;

    const discoveredDate = room.discoveredAt;

    if (query.extended && query.extended === 'true') {
        const userDb = useDatabase('users');

        const totalUniqueUsersQueryResult = await userDb.sql`SELECT COUNT(DISTINCT userId) FROM unlocks WHERE roomId = ${id}`;
        const totalUniqueUsers = totalUniqueUsersQueryResult.rows ? totalUniqueUsersQueryResult.rows[0].count : 0;

        const lastMessageQueryResult = await db.sql`SELECT * FROM messages WHERE roomId = ${id} ORDER BY createdAt DESC LIMIT 1`;
        const lastMessage = lastMessageQueryResult.rows ? lastMessageQueryResult.rows[0] : null;

        const discovererQueryResult = await userDb.sql`SELECT username FROM accounts WHERE id = ${room.discoveredBy as string}`;
        const discoverer = discovererQueryResult.rows ? discovererQueryResult.rows[0].username : null;

        const stats = {
            totalMessages,
            totalViews,
            totalUniqueUsers,
            totalUniqueMessageSenders,
            discoveredDate, // if there are no messages, this will be null
            lastMessage, // if there are no messages, this will be null
            discoverer // if there are no discoverers, this will be null
        };

        return { code: 200, stats };
    }

    const stats = {
        totalMessages,
        totalViews,
        totalUniqueMessageSenders,
        discoveredDate
    };

    return { code: 200, stats };
});