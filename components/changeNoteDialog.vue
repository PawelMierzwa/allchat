<template>
    <div class="px-12 py-8 bg-neutral-100 dark:bg-neutral-950/90 rounded-xl flex flex-col items-center gap-4 justify-between">
        <h2 class="text-2xl text-primary-500">{{ $t('generic.changes') }}</h2>
        <ul class="list-disc list-inside">
            <li v-for="note in data" :key="note">{{ note }}</li>
        </ul>
        <UButton @click="$emit('close')" variant="link" color="neutral" class="self-end">{{ $t('generic.close') }}</UButton>
    </div>
</template>

<script setup>
const { data } = await useFetch(`/api/changenotes`);
</script>