import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    const { username, email, password } = await readBody(event);
    const db = useDatabase("users");
    if (!db) {
        return { status: 500, message: "Database not available" };
    }
    if (!username || !email || !password) {
        return { status: 400, message: "Username, email, and password are required" };
    }
    const result = await db.sql`SELECT * FROM accounts WHERE username = ${username}`;
    const rows = result?.rows ?? [];
    if (rows.length > 0) {
        return { status: 400, message: "Username already exists" };
    }
    const hash = await hashPassword(password);
    const id = uuidv4();
    await db.sql`INSERT INTO accounts (id, username, email, password) VALUES (${id}, ${username}, ${email}, ${hash})`;

    // Generate a JWT token
    const secret = useRuntimeConfig(event).jwtSecret;
    const token = jwt.sign({ id, email, name: username }, secret as jwt.Secret);
    setCookie(event, 'token', token);

    return {
        status: 200, message: {
            id: id,
            email: email,
            name: username,
        }
    };
});

async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}