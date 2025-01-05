import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'token');
    if (token === undefined) {
        return { code: 401, message: 'Unauthorized' };
    }

    const body = await readBody(event);
    if (!body.id || !body.passphrase) {
        return { code: 400, message: 'Invalid body' };
    }

    // hash the passphrase
    const hash = crypto.createHash('sha1').update(body.passphrase).digest('hex');
    console.log(hash);

    let userId = "";

    jwt.verify(token, useRuntimeConfig().jwtSecret, (err, decoded) => {
        if (err) {
            return { code: 401, message: 'Unauthorized' };
        }
        if ((decoded as jwt.JwtPayload).id !== body.id) {
            return { code: 403, message: 'Forbidden' };
        }
        userId = (decoded as jwt.JwtPayload).id;
    });

    // check if the user has already unlocked the hash (room)

    const userDb = useDatabase("users");
    const userResult = await userDb.sql`SELECT * FROM accounts WHERE id = ${userId}`;
    const userRows = userResult?.rows ?? [];

    if (userRows.length === 0) {
        return { code: 404, message: 'Not Found' };
    }

    const chatDb = useDatabase("chat");
    const roomResult = await chatDb.sql`SELECT * FROM rooms WHERE id = ${hash}`;
    const roomRows = roomResult?.rows ?? [];
    if (roomRows.length === 0) {
        // add the room to the database, discovered by the user
        const roomInsertOutcome = await chatDb.sql`INSERT INTO rooms (id, views, discoveredBy) VALUES (${hash}, 1, ${userId})`;
        if (roomInsertOutcome.error) {
            return { code: 500, message: 'Internal Server Error' };
        }
    } else {
        // Not sure if this is the correct way to update the views 
        // (cases where the room is entered from a direct URL are not handled)
        const roomUpdateOutcome = await chatDb.sql`UPDATE rooms SET views = views + 1 WHERE id = ${hash}`;
        if (roomUpdateOutcome.error) {
            return { code: 500, message: 'Internal Server Error' };
        }
    }

    const unlocksResult = await userDb.sql`SELECT * FROM unlocks WHERE roomId = ${hash} AND userId = ${userId}`;
    const unlockRows = unlocksResult?.rows ?? [];
    if (unlockRows.length !== 0) {
        // user already unlocked the hash, let them in
        return { code: 200, message: hash };
    }

    // add the hash to user's account
    const unlockId = uuidv4();
    const hashUpdateOutcome = await userDb.sql`INSERT INTO unlocks (id, roomId, userId) VALUES (${unlockId}, ${hash}, ${userId})`;
    if (hashUpdateOutcome.error) {
        return { code: 500, message: 'Internal Server Error' };
    }
    return { code: 200, message: hash };
});