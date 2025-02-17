interface UserData {
    value: {
        id: string;
        name: string;
        email: string;
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    if (!useSessionStore().user) {
        const { data }: { data: UserData } = await useFetch('/api/account/auth');
        if (data.value) {
            const user = {
                id: data.value.id,
                name: data.value.name,
                email: data.value.email,
            }
            useSessionStore().login(user);
        } else {
            if (to.path !== '/') {
                return navigateTo('/');
            }
        }
    }
});