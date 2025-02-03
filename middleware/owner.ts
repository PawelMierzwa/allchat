export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSessionStore().user;
    if (user) {
        if (user.id === to.fullPath.split('/')[2]) {
            return navigateTo('/profile');
        }
    }
});