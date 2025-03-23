<template>
    <UContainer class="flex flex-col items-center my-auto font-mono">
        <h1 class="text-3xl mb-8">Settings</h1>
        <UTabs :items="tabs" size="lg" :content="true" default-value="0" v-model="selectedTab" class="w-full scroll" v-if="isAuthenticated">
            <template #general>
                <div id="General">
                    <SettingsGeneral />
                </div>
            </template>
            <template #appearance>
                <div id="Appearance">
                    <SettingsAppearance />
                </div>
            </template>
            <template #account>
                <div id="Account">
                    <SettingsAccount />
                </div>
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

<script setup>
const tabs = [
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
];

const isAuthenticated = computed(() => useSessionStore().isAuthenticated);
const selectedTab = ref('0');

onMounted(() => {
    if (window.location.hash) {
        const hashValue = window.location.hash.slice(1).toLowerCase();
        const tabIndex = tabs.findIndex(tab => tab.slot === hashValue);
        if (tabIndex !== -1) {
            selectedTab.value = String(tabIndex);
            history.replaceState("", document.title, window.location.pathname + window.location.search);
        }
    }
});

definePageMeta({
    middleware: 'auth',
});

useHead({
    title: () => tabs[selectedTab.value].label + ' Settings',
})
</script>