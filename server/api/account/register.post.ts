import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event) => {
    const { username, email, password } = await readBody(event);
    const db = useDatabase("users");
    const hash = await hashPassword(password);
    const id = uuidv4();
    await db.sql`INSERT INTO users (id, username, email, password) VALUES (${id}, ${username}, ${email}, ${hash})`;
    return new Response(JSON.stringify({ id }), { headers: { "Content-Type": "application/json" } });
});

async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}