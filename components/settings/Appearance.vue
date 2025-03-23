<template>
    <div class="flex flex-col justify-between gap-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md">
        <div class="flex flex-row items-center justify-between gap-4">
            <p class="text-center">Theme</p>
            <USelect size="lg" v-model="$colorMode.preference" :items="themes" />
        </div>
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
            ],
            fontSize: 1
        }
    }
}
</script>