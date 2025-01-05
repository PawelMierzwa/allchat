<template>
    <UContainer class="flex flex-col items-center pt-32 md:p-32">
        <h1 class="text-3xl mb-8">Settings</h1>
        <div class="flex flex-row items-center justify-between gap-4">
            <p class="text-center">Theme</p>
            <USelect size="lg" v-model="$colorMode.preference" :options="themes" />
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
            ]
        }
    },
}
</script>