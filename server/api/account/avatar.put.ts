import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const body = await readFormData(event);
    const { imgUploadUrl } = useRuntimeConfig();
    const token = getCookie(event, 'token');
    if (!token) {
        return { status: 401, message: 'Unauthorized' }
    }

    const avatar = body.get('avatar');
    if (!avatar) {
        return { status: 400, message: 'No avatar provided' };
    }

    if ((avatar as File).size > 2000000) {
        return { status: 400, message: 'File too large' };
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

    const formData = new FormData();
    const blob = new Blob([avatar as BlobPart], { type: 'image/webp' });
    formData.append('avatar', blob, userId + '.webp');
    const response = await $fetch.raw(imgUploadUrl + userId + '.webp', {
        method: 'PUT',
        headers: {
            'Auth-Secret': useRuntimeConfig().workerSecret,
        },
        body: formData,
    });

    console.log('Upload:', response);

    return {
        status: response.status,
        message: response.status === 200 ? 'Avatar uploaded' : 'Error uploading avatar'
    };
});