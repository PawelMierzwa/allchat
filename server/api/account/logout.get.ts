export default defineEventHandler(async (event) => {

    const token = getCookie(event, 'token');
    if (!token) {
        return { code: 401, message: 'Unauthorized' };
    }
    
    deleteCookie(event, 'token');
    return { code: 200, message: 'Logged out' };
});