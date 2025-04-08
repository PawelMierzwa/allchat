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

    const response = await $fetch.raw(useRuntimeConfig().imgUploadUrl + userId + '.webp', {
        method: 'DELETE',
        headers: {
            'Auth-Secret': useRuntimeConfig().workerSecret,
        },
    });

    return {
        status: response.status,
        message: response.status === 200 ? 'Avatar deleted successfully' : 'Error deleting avatar'
    }
});