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
    // there should be only one query parameter, extended (optional)
    if (Object.keys(query).length > 1) {
        return {
            code: 400,
            message: 'Bad Request'
        };
    } else if (Object.keys(query).length === 1 && !query.extended) {
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
                const userId = (decoded as jwt.JwtPayload).id;
                const userDb = useDatabase('users');
                const unlockResult = await userDb.sql`SELECT * FROM unlocks WHERE roomId = ${id} AND userId = ${userId}`;
                if (!unlockResult.rows || unlockResult.rows.length === 0) {
                    return {
                        code: 403,
                        message: 'Forbidden'
                    };
                }
            }
        });
    }

    const chatDb = useDatabase('chat');
    const roomStats = await chatDb.sql`SELECT * FROM rooms WHERE id = ${id}`;
    if (!roomStats.rows || roomStats.rows.length === 0) {
        return {
            code: 404,
            message: 'Not Found'
        };
    }

    const room = roomStats.rows[0];
    // get total messages in the room
    // dont get the messages, just the count
    const messageCountQueryResult = await chatDb.sql`SELECT COUNT(*) as count FROM messages WHERE roomId = ${id}`;
    const totalMessages = messageCountQueryResult.rows ? messageCountQueryResult.rows[0].count : 0;

    const totalViews = room.views;

    // get unique users in the room
    const uniqueMsgSendersQueryResult = await chatDb.sql`SELECT DISTINCT userId FROM messages WHERE roomId = ${id}`;
    const totalUniqueMessageSenders = uniqueMsgSendersQueryResult.rows ? uniqueMsgSendersQueryResult.rows.length : 0;

    if (query.extended === 'true') {
        const lastMessageQueryResult = await chatDb.sql`SELECT * FROM messages WHERE roomId = ${id} ORDER BY createdAt DESC LIMIT 1`;
        const lastMessage = lastMessageQueryResult.rows ? lastMessageQueryResult.rows[0] : null;

        const stats = {
            totalMessages,
            totalViews,
            totalUniqueMessageSenders,
            lastMessage
        };

        return { code: 200, stats };
    } else {
        const userDb = useDatabase('users');

        const totalUniqueUsersQueryResult = await userDb.sql`SELECT COUNT(DISTINCT userId) as userCount FROM unlocks WHERE roomId = ${id}`;
        const totalUniqueUsers = totalUniqueUsersQueryResult.rows ? totalUniqueUsersQueryResult.rows[0].userCount : 0;

        const stats = {
            totalMessages,
            totalViews,
            totalUniqueUsers,
            totalUniqueMessageSenders,
        };

        return { code: 200, stats };
    }
});