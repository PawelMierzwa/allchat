<template>
    <div class="flex flex-col relative overflow-x-hidden font-mono h-screen w-screen">
        <nav class="flex flex-row justify-between items-center w-full z-49 px-4 bg-neutral-100/60 dark:bg-neutral-900">
            <NuxtLink to="/"
                class="flex items-center gap-2 p-2 text-primary-500 hover:bg-neutral-800/40 dark:text-neutral-400 hover:text-primary-50 hover:dark:text-white rounded-lg">
                <h1 class="text-xl">AllChat</h1>
            </NuxtLink>
            <div class="flex flex-row gap-2 items-center">
                <div class="p-2 flex flex-row gap-2 self-end">
                    <NuxtLink to="/leaderboard"
                        class="group flex items-center gap-2 p-2 hover:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 hover:text-primary-50 hover:dark:text-white rounded-lg">
                        <UIcon name="i-mdi-trophy" class="text-xl" />
                        <span>{{ $t('generic.leaderboard') }}</span>
                    </NuxtLink>
                    <NuxtLink to="/about"
                        class="group flex items-center gap-2 p-2 hover:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 hover:text-primary-50 hover:dark:text-white rounded-lg">
                        <UIcon name="i-heroicons-information-circle" class="text-xl" />
                        <span>{{ $t('generic.about') }}</span>
                    </NuxtLink>
                </div>
                <ClientOnly>
                    <UDropdownMenu :items="items" v-model:open="open" :popper="{ arrow: true }" v-if="isAuthenticated">
                        <div :data-open="open"
                            class="group flex items-center gap-2 p-2 h-fit cursor-pointer hover:bg-neutral-800/40 data-[open=true]:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 hover:text-primary-50 hover:dark:text-white data-[open=true]:text-primary-50 data-[open=true]:dark:text-white rounded-lg">
                            <p class="text-md select-none">{{ $t("generic.profile") }}</p>
                            <UAvatar :src="useRuntimeConfig().public.imgUrl + user.id + '.webp'"
                                :alt="user.name.toUpperCase()" size="xs" :class="open ? 'grayscale-0' : 'grayscale'"
                                class="group-hover:grayscale-0" />
                        </div>
                        <template #account>
                            <div class="flex items-center">
                                <div class="ml-2">
                                    <p class="font-bold text-start">{{ user.name }}</p>
                                    <p class="text-xs text-start">{{ user.email }}</p>
                                </div>
                            </div>
                        </template>
                        <template #item="{ item }"">
                            <UButton :to="item.to" variant="link" class="flex items-center gap-2 w-full group-hover:text-neutral-700 group-hover:dark:text-white" color="neutral">
                                <UIcon :name="item.icon" class="text-xl" />
                                <span>{{ $t(`generic.${item.label}`) }}</span>
                            </UButton>
                        </template>
                    </UDropdownMenu>
                </ClientOnly>
            </div>
        </nav>
        <div v-if="showChangeNoteDialog"
            class="absolute top-0 left-0 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center gap-2 p-4 z-50">
            <Suspense>
                <ChangeNoteDialog @close="showChangeNoteDialog = false" />
                <template #fallback>
                    <div
                        class="h-40 w-80 bg-neutral-100 dark:bg-neutral-950/90 flex flex-col items-center justify-center rounded-xl">
                        <UIcon name="i-mdi-loading" class="animate-spin text-4xl" />
                    </div>
                </template>
            </Suspense>
        </div>
        <slot class="overflow-y-auto" />
        <footer
            class="bg-neutral-100/60 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 text-center p-4 mt-auto w-full">
            <p class="text-xs">&copy; {{ currentYear }} AllChat</p>
        </footer>
    </div>
</template>

<script>
export default {
    data() {
        return {

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

        const { t } = useI18n({ useScope: 'global' });

        const showChangeNoteDialog = ref(false);
        const items = [
            [{
                label: 'Account',
                slot: 'account',
                disabled: true,
            }],
            [
                {
                    label: 'profile',
                    icon: 'i-mdi-account',
                    to: '/profile',
                },
                {
                    label: 'changes',
                    icon: 'i-mdi-clipboard-text',
                    onSelect: () => {
                        showChangeNoteDialog.value = true;
                    }
                },
                {
                    label: 'settings',
                    to: '/settings',
                    icon: 'i-heroicons-cog',
                }
            ],
            [{  
                label: 'logout',
                icon: 'i-mdi-logout',
                onSelect: () => logout(),
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

        const { setLocale } = useI18n({ useScope: 'global' });
        onMounted(() => {
            if (localStorage.getItem('locale')) {
                setLocale(localStorage.getItem('locale'));
            }
        });

        return { user, open, items, isAuthenticated, showChangeNoteDialog, setLocale };
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        }
    },
}
</script>