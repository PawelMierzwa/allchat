import crypto from 'crypto';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const hash = crypto.createHash('sha1').update(body.passphrase).digest('hex');
    return hash;
});