<template>
    <UContainer class="flex flex-col items-center pt-32 md:p-32 font-mono">
        <h1 class="text-3xl mb-8">Settings</h1>
        <UTabs :items="tabs" class="w-full" v-if="isAuthenticated">
            <template #general>
                <SettingsGeneral />
            </template>
            <template #appearance>
                <SettingsAppearance />
            </template>
            <template #account>
                <SettingsAccount />
            </template>
        </UTabs>
        <div v-else>
            <p class="text-center">You need to be logged in to access this page</p>
            <NuxtLink to="/" class="text-primary-500 hover:text-primary-800 mt-4 text-sm w-fit cursor-pointer"
                variant="link">
                Go back
            </NuxtLink>
        </div>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            themes: [
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' }
            ],
            tabs: [
                {
                    slot: 'general',
                    label: 'General',
                    icon: 'i-heroicons-cog',
                },
                {
                    slot: 'appearance',
                    label: 'Appearance',
                    icon: 'i-heroicons-computer-desktop-solid',
                },
                {
                    slot: 'account',
                    label: 'Account',
                    icon: 'i-mdi-account',
                }
            ]
        }
    },
    setup() {
        const isAuthenticated = computed(() => useSessionStore().isAuthenticated);
        definePageMeta({
            middleware: 'auth',
        })
        return { isAuthenticated };
    }
}
</script>