<template>
    <div>
        <nav class="flex flex-row justify-between items-center px-4 bg-gray-900 text-white">
            <UHorizontalNavigation :links="links" class="border-b border-gray-200 p-2 dark:border-gray-800">
                <template #default="{ link, isActive }">
                    <span :data-active="isActive"
                        class="data-[active=true]:text-primary-50 data-[active=true]:group-hover:text-black data-[active=true]:group-hover:dark:text-white relative">
                        {{ link.label }}
                    </span>
                </template>
            </UHorizontalNavigation>
            <ClientOnly>
                <UDropdown :items="items" :popper="{ arrow: true }" v-if="isAuthenticated">
                    <div class="flex items-center gap-2">
                        <p class="text-sm">Profile</p>
                        <UAvatar :src="'https://i.pravatar.cc/32?u=' + user.id" size="xs" />
                    </div>
                    <template #account>
                        <div class="flex items-center">
                            <div class="ml-2">
                                <p class="font-bold text-start">{{ user.name }}</p>
                                <p class="text-xs">{{ user.email }}</p>
                            </div>
                        </div>
                    </template>
                </UDropdown>
            </ClientOnly>
        </nav>
        <UContainer>
            <slot />
        </UContainer>
        <footer class="bg-gray-900 text-gray-400 text-center p-4 bottom-0 absolute w-full">
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
                    { label: 'Settings', to: '/settings', icon: 'i-heroicons-cog' },
                    { label: 'About', to: '/about', icon: 'i-heroicons-information-circle' },
                ]
            ],
        }
    },
    setup() {
        const sessionStore = useSessionStore();
        const user = computed(() => sessionStore.user);
        const isAuthenticated = computed(() => sessionStore.isAuthenticated);
        const logout = function () {
            sessionStore.logout();
        }

        const items = [
            [{
                label: 'Profile',
                slot: 'account',
                disabled: true,
            },
            ], [{
                label: 'Change Notes',
                icon: 'i-mdi-clipboard-text',
                shortcuts: ['C'],
                click: () => {
                    console.log('Change notes');
                }
            }, {
                label: 'Logout',
                icon: 'i-mdi-logout',
                shortcuts: ['L'],
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

        return { user, items, isAuthenticated };
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        }
    }
}
</script>