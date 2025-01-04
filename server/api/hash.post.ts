import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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

    // check if the user is authorized to view this match

    const db = useDatabase("users");
    const result = await db.sql`SELECT * FROM accounts WHERE id = ${userId}`;
    const rows = result?.rows ?? [];
    
    if (rows.length === 0) {
        return { code: 404, message: 'Not Found' };
    }

    const user = rows[0];
    if (user.rooms === null) {
        user.rooms = "";
    }
    if ((user.rooms as string).split(" ").includes(hash)) {
        return { code: 200, message: hash };
    }

    // add the hash to user's account

    if (user.rooms === null) {
        user.rooms = hash;
    } else {
        user.rooms = user.rooms + " " + hash;
    }
    const hashUpdateOutcome = await db.sql`UPDATE accounts SET rooms = ${user.rooms as string} WHERE id = ${userId}`;
    if (hashUpdateOutcome.error) {
        return { code: 500, message: 'Internal Server Error' };
    }
    return { code: 200, message: hash };
});