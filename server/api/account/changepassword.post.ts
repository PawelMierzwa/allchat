import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    const { currentPassword, newPassword } = await readBody(event);
    const db = useDatabase("users");
    if (!db) {
        return { status: 500, message: "Database not available" };
    }
    if (!newPassword || !currentPassword) {
        return { status: 400, message: "Invalid data" };
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(currentPassword)) {
        return { status: 400, message: "Current password is invalid" };
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
        return { status: 400, message: "Password must be at least 8 characters and contain at least one letter, one number, and one special character" };
    }

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

    const result = await db.sql`SELECT * FROM accounts WHERE id = ${userId}`;
    const rows = result?.rows ?? [];

    if (rows.length === 0) {
        return { status: 400, message: 'Invalid user' };
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password as string | '');

    if (!passwordMatch) {
        return { status: 400, message: 'Current password is invalid' };
    }

    const hash = await hashPassword(newPassword);
    await db.sql`UPDATE accounts SET password = ${hash} WHERE id = ${userId}`;

    return {
        status: 200, message: "Password changed successfully"
    };
});

async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}