import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    const { username, password, remember } = await readBody(event);

    if (!username || !password) {
        return { status: 400, message: 'Username and password are required' };
    }

    if (username.length < 3 || password.length < 3) {
        return { status: 400, message: 'Invalid username or password' };
    }

    const db = useDatabase("users");

    const result = await db.sql`SELECT * FROM accounts WHERE username = ${username}`;
    const rows = result?.rows ?? [];

    if (rows.length === 0) {
        return { status: 400, message: 'Invalid username or password' };
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password as string | '');

    if (!passwordMatch) {
        return { status: 400, message: 'Invalid username or password' };
    }

    const secret = useRuntimeConfig(event).jwtSecret;
    const token = jwt.sign({ id: user.id, email: user.email, name: user.username }, secret as jwt.Secret);
    
    if (remember) {
        setCookie(event, 'token', token, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) });
    } else {
        setCookie(event, 'token', token);
    }

    return {
        status: 200,
        message: {
            id: user.id,
            email: user.email,
            name: user.username,
        }
    };
});