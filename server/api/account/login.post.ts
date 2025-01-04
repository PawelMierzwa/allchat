import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    // Get the email and password from the request body
    const { username, password } = await readBody(event);

    // Validate the email and password
    if (!username || !password) {
        return { status: 400, message: 'Username and password are required' };
    }

    // Get the database
    const db = useDatabase("users");

    // Query for the user with the given email
    const result = await db.sql`SELECT * FROM accounts WHERE username = ${username}`;
    const rows = result?.rows ?? [];

    // If the user does not exist, throw an error
    if (rows.length === 0) {
        return { status: 400, message: 'Invalid username or password' };
    }

    // Get the user
    const user = rows[0];

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password as string | '');

    // If the password does not match, throw an error
    if (!passwordMatch) {
        return { status: 400, message: 'Invalid username or password' };
    }

    // Generate a JWT token
    const secret = useRuntimeConfig(event).jwtSecret;
    const token = jwt.sign({ id: user.id, email: user.email, name: user.username }, secret as jwt.Secret);
    setCookie(event, 'token', token);
    // Return user data
    return {
        status: 200,
        message: {
            id: user.id,
            email: user.email,
            name: user.username,
        }
    };
});