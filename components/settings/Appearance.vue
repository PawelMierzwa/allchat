<template>
    <div class="flex flex-row items-center justify-between gap-4">
        <p class="text-center">Theme</p>
        <USelect size="lg" v-model="$colorMode.preference" :options="themes" />
    </div>
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
    }
}
</script>