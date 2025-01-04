interface User {
    id: string;
    name: string;
    email: string;
}

export const useSessionStore = defineStore('session', {
    state: () => ({
        user: null as User | null,
    }),
    actions: {
        async login(user: User) {
            this.user = user;
        },
        async logout() {
            $fetch('/api/account/logout');
            this.user = null;
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.user,
    },
});