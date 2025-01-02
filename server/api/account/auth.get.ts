import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'token');
    if (!token) {
        return new Response(null, { status: 401 });
    }
    const user = await authenticate(token);
    if (!user) {
        return new Response(null, { status: 401 });
    }
    return new Response(JSON.stringify(user), { headers: { "Content-Type": "application/json" } });
});

async function authenticate(token: string): Promise<any> {
    const secret: jwt.Secret = useRuntimeConfig().jwtSecret;
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return resolve(null);
            }
            resolve(decoded);
        });
    });
}