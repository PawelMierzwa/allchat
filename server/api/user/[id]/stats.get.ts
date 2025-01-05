import jwt, { JwtPayload } from 'jsonwebtoken';

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
    // there should be only one query parameter, room (optional) or size (optional: sm, md, lg)
    if (Object.keys(query).length > 1) {
        return {
            code: 400,
            message: 'Bad Request'
        };
    }

    // stats:
    // - total messages by the user (all messages with the user id)
    // - total messages in the room by the user (all messages with the user id in the room)
    // - total rooms joined by the user (user.rooms length)
    // - total rooms discovered by the user (rooms.discoveredBy length)

    // if query room is provided, count the messages in the room
    if (query.room) {
        // verify if the user is authorized to view stats of the room
        jwt.verify(token, useRuntimeConfig(event).jwtSecret, async (err, decoded) => {
            if (err) {
                return {
                    code: 401,
                    message: 'Unauthorized'
                };
            } else {
                const userDb = useDatabase('users');
                const unlockQueryResult = await userDb.sql`SELECT id FROM unlocks WHERE userId = ${(decoded as JwtPayload).id} AND roomId = ${query.room as string}`;
                const unlockRows = unlockQueryResult.rows ? unlockQueryResult.rows[0] : null;
                if (!unlockRows) {
                    return {
                        code: 401,
                        message: 'Unauthorized'
                    };
                }
            }
        });
    }

    const chatDb = useDatabase('chat');
    const userDb = useDatabase('users');

    const messagesQueryResult = await chatDb.sql`SELECT * FROM messages WHERE userId = ${id}`;
    const messages = messagesQueryResult.rows ? messagesQueryResult.rows : [];

    let roomMessages = [];
    if (query.room) {
        const roomMessagesQueryResult = await chatDb.sql`SELECT * FROM messages WHERE userId = ${id} AND roomId = ${query.room as string}`;
        roomMessages = roomMessagesQueryResult.rows ? roomMessagesQueryResult.rows : [];
    }

    const roomsJoinedQueryResult = await userDb.sql`SELECT * FROM unlocks WHERE userId = ${id}`;
    const roomsJoined = roomsJoinedQueryResult.rows ? roomsJoinedQueryResult.rows : [];

    const roomsDiscoveredQueryResult = await chatDb.sql`SELECT * FROM rooms WHERE discoveredBy = ${id}`;
    const roomsDiscovered = roomsDiscoveredQueryResult.rows ? roomsDiscoveredQueryResult.rows : [];

    let stats = {};

    if (query.size) {
        switch (query.size) {
            case 'sm':
                stats = {
                    totalMessages: messages.length
                };
                break;
            case 'md':
                stats = {
                    totalMessages: messages.length,
                    totalRoomMessages: roomMessages.length
                };
                break;
            case 'lg':
                stats = {
                    totalMessages: messages.length,
                    totalRoomsJoined: roomsJoined.length,
                    totalRoomsDiscovered: roomsDiscovered.length
                };
                break;
            default:
                return { code: 400, message: 'Bad Request' };
        }
    } else {
        stats = {
            totalMessages: messages.length,
            totalRoomMessages: roomMessages.length,
            totalRoomsJoined: roomsJoined.length,
            totalRoomsDiscovered: roomsDiscovered.length
        };
    }

    return { code: 200, stats };
});