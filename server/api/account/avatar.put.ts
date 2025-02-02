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
    
    const formData = new FormData();
    formData.append('avatar', avatar);
    const response: {
        status: number,
        message: string,
    } = await $fetch(imgUploadUrl + 'user/avatar', {
        method: 'POST',
        headers: {
            'Auth-Token': token,
        },
        body: formData,
    });

    console.log('Upload:', response);

    return { status: response.status, message: response.message };
});