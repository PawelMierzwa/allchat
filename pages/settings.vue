<template>
    <UContainer>
        <h1>Settings</h1>
        <div>
            Theme
            <USelect v-model="$colorMode.preference" :options="themes" />
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