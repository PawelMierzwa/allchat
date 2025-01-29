export default defineNuxtRouteMiddleware(async (to, from) => {
    if (useSessionStore().user && useSessionStore().passphraseCache != "") {
        const { data } = await useFetch(`/api/room/${to.params.id}/verifyUser`);
        if (data.value) {
            if (data.value.code === 200) {
                return;
            } else {
                return navigateTo("/");
            }
        } else {
            return abortNavigation("Error");
        }
    }
    else {
        return navigateTo("/");
    }
});