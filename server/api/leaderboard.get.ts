export default defineEventHandler(async (event) => {
    const userDb = useDatabase("users");
    const chatDb = useDatabase("chat");

    const leaderboard = await userDb.sql`SELECT * FROM leaderboard ORDER BY createdAt DESC LIMIT 1`;
    const leaderboardRows = leaderboard?.rows ?? [];

    // if there is no leaderboard entry (or the last one is older than 12 hours), create one
    if (leaderboardRows.length === 0 || Date.now() - new Date(leaderboardRows[0].createdAt as string).getTime() > 12 * 60 * 60 * 1000) {
        // top 10 users with the most messages
        const messages = await chatDb.sql`SELECT userId, COUNT(*) as count FROM messages GROUP BY userId ORDER BY count DESC LIMIT 10`;
        const messageRows = messages?.rows ?? [];
        const messageUsers = await Promise.all(messageRows.map(async (row: any) => {
            const user = await userDb.sql`SELECT * FROM accounts WHERE id = ${row.userId}`;
            return user?.rows ? { username: user.rows[0].username, count: row.count } : { username: 'Unknown', count: row.count };
        }));

        // top 10 users with the most discovered rooms
        const discoveredRooms = await chatDb.sql`SELECT discoveredBy, COUNT(*) as count FROM rooms GROUP BY discoveredBy ORDER BY count DESC LIMIT 10`;
        const discoveredRows = discoveredRooms?.rows ?? [];
        const discoveredUsers = await Promise.all(discoveredRows.map(async (row: any) => {
            const user = await userDb.sql`SELECT * FROM accounts WHERE id = ${row.discoveredBy}`;
            return user?.rows ? { username: user.rows[0].username, count: row.count } : { username: 'Unknown', count: row.count };
        }));

        // top 10 users with the most joined rooms
        const joinedRooms = await userDb.sql`SELECT userId, COUNT(*) as count FROM unlocks GROUP BY userId ORDER BY count DESC LIMIT 10`;
        const joinedRows = joinedRooms?.rows ?? [];
        const joinedUsers = await Promise.all(joinedRows.map(async (row: any) => {
            const user = await userDb.sql`SELECT * FROM accounts WHERE id = ${row.userId}`;
            return user?.rows ? { username: user.rows[0].username, count: row.count } : { username: 'Unknown', count: row.count };
        }));

        await userDb.sql`INSERT INTO leaderboard (mostMessages, mostDiscoveredRooms, mostJoinedRooms) VALUES (${JSON.stringify(messageUsers)}, ${JSON.stringify(discoveredUsers)}, ${JSON.stringify(joinedUsers)})`;

        return {
            code: 200,
            message: 'Leaderboard',
            leaderboard: {
                messages: messageUsers,
                discoveredRooms: discoveredUsers,
                joinedRooms: joinedUsers,
            }
        };
    } else {
        return {
            code: 200,
            message: 'Leaderboard',
            leaderboard: {
                messages: JSON.parse(leaderboardRows[0].mostMessages as string),
                discoveredRooms: JSON.parse(leaderboardRows[0].mostDiscoveredRooms as string),
                joinedRooms: JSON.parse(leaderboardRows[0].mostJoinedRooms as string),
            }
        };
    }
});