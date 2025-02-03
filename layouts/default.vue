<template>
    <div class="flex flex-col relative overflow-x-hidden h-screen w-screen">
        <nav class="flex flex-row justify-between items-center w-full z-50 px-4 bg-gray-900">
            <UHorizontalNavigation :links="links" class="p-2">
                <template #default="{ link, isActive }">
                    <span :data-active="isActive"
                        class="data-[active=true]:text-primary-50 data-[active=true]:group-hover:text-black data-[active=true]:group-hover:dark:text-white relative">
                        {{ link.label }}
                    </span>
                </template>
            </UHorizontalNavigation>
            <ClientOnly>
                <UDropdown :items="items" v-model:open="open" :popper="{ arrow: true }" v-if="isAuthenticated">
                    <div :data-open="open"
                        class="group flex items-center gap-2 p-2 hover:bg-gray-800/40 data-[open=true]:bg-gray-800/40 text-gray-500 dark:text-gray-400 hover:text-primary-50 hover:dark:text-white data-[open=true]:text-primary-50 data-[open=true]:dark:text-white rounded-lg">
                        <p class="text-sm select-none">Profile</p>
                        <UAvatar :src="useRuntimeConfig().public.imgUrl + user.id + '.webp'" :alt="user.name.toUpperCase()" size="xs"
                            :class="open ? 'grayscale-0' : 'grayscale'" class="group-hover:grayscale-0" />
                    </div>
                    <template #account>
                        <div class="flex items-center">
                            <div class="ml-2">
                                <p class="font-bold text-start">{{ user.name }}</p>
                                <p class="text-xs text-start">{{ user.email }}</p>
                            </div>
                        </div>
                    </template>
                </UDropdown>
            </ClientOnly>
        </nav>
        <slot class="overflow-y-auto" />
        <footer class="bg-gray-900 text-gray-400 text-center p-4 mt-auto w-full">
            <p class="text-xs">&copy; {{ currentYear }} AllChat</p>
        </footer>
    </div>
</template>

<script>
export default {
    data() {
        return {
            links: [
                [{ label: 'AllChat', to: '/' }],
                [
                    { label: 'Leaderboard', to: '/leaderboard', icon: 'i-mdi-trophy' },
                    { label: 'About', to: '/about', icon: 'i-heroicons-information-circle' },
                ]
            ],
        }
    },
    setup() {
        const sessionStore = useSessionStore();
        const user = computed(() => sessionStore.user);
        const isAuthenticated = computed(() => sessionStore.isAuthenticated);
        const open = ref(false);
        const logout = function () {
            sessionStore.logout();
            open.value = false;
            const router = useRouter();
            router.push('/');
        }

        const items = [
            [{
                label: 'Account',
                slot: 'account',
                disabled: true,
            }],
            [
                {
                    label: 'Profile',
                    icon: 'i-mdi-account',
                    to: '/profile',
                },
                {
                    label: 'Change Notes',
                    icon: 'i-mdi-clipboard-text',
                    click: () => {
                        console.log('Change notes');
                    }
                },
                {
                    label: 'Settings',
                    to: '/settings',
                    icon: 'i-heroicons-cog',
                }
            ],
            [{
                label: 'Logout',
                icon: 'i-mdi-logout',
                click: () => logout(),
            }],
        ]

        useHead({
            titleTemplate(titleChunk) {
                return titleChunk ? `AllChat | ${titleChunk}` : 'AllChat';
            },
            meta: [
                { name: 'description', content: 'Chat with everyone through passphrases.' },
                { name: 'keywords', content: 'chat, passphrase, room, allchat, social media, social' },
                { name: 'author', content: 'BadInfluence' }
            ]
        });

        return { user, open, items, isAuthenticated };
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        }
    }
}
</script>