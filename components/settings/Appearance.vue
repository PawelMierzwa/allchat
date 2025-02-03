<template>
    <div class="flex flex-col justify-between gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
        <div class="flex flex-row items-center justify-between gap-4">
            <p class="text-center">Theme</p>
            <USelect size="lg" v-model="$colorMode.preference" :options="themes" />
        </div>
        <div class="flex flex-row items-center justify-between gap-4">
            <p class="text-cente w-1/2r">Font size: {{ fontSize }}</p>
            <URange class="w-1/2" size="sm" v-model="fontSize" :min="0.8" :max="2" :step="0.1" />
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