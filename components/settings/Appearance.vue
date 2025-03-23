<template>
    <div class="flex flex-col justify-between gap-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md">
        <div class="flex flex-row items-center justify-between gap-4">
            <p class="text-center">{{ $t('settings.theme') }}</p>
            <USelect size="lg" v-model="$colorMode.preference" :items="themes" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            themes: [
                { label: this.$t('settings.darkTheme'), value: 'dark' },
                { label: this.$t('settings.lightTheme'), value: 'light' },
                { label: this.$t('settings.system'), value: 'system' }
            ],
            fontSize: 1
        }
    }
}
</script>