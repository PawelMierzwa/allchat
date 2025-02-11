import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'token');
    if (!token) {
        return { status: 401, message: 'Unauthorized' }
    }

    let userId = "";
    jwt.verify(token, useRuntimeConfig().jwtSecret, (err, decoded) => {
        if (err) {
            return { status: 401, message: 'Unauthorized' };
        }
        userId = (decoded as jwt.JwtPayload).id;
    });

    if (!userId) {
        return { status: 401, message: 'Unauthorized' };
    }

    // TODO: Implement 2FA
    return { status: 501, message: 'Not Implemented' };
});