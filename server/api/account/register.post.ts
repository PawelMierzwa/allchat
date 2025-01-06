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

    if (!/^[a-zA-Z0-9_]{4,16}$/.test(username)) {
        return { status: 400, message: "Username must be 4-16 characters and contain only letters, numbers, and underscores" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { status: 400, message: "Invalid email" };
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        return { status: 400, message: "Password must be at least 8 characters and contain at least one letter and one number" };
    }

    const result = await db.sql`SELECT id FROM accounts WHERE username = ${username}`;
    const rows = result?.rows ?? [];
    if (rows.length > 0) {
        return { status: 400, message: "Username is already taken" };
    }

    const emailResult = await db.sql`SELECT id FROM accounts WHERE email = ${email}`;
    const emailRows = emailResult?.rows ?? [];
    if (emailRows.length > 0) {
        return { status: 400, message: "Email is already taken" };
    }

    const hash = await hashPassword(password);
    const id = uuidv4();
    await db.sql`INSERT INTO accounts (id, username, email, password) VALUES (${id}, ${username}, ${email}, ${hash})`;

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