<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
    error: Object as () => NuxtError
})
</script>

<template>
    <NuxtLayout>
        <div class="font-mono pt-32 md:p-32 text-center mx-auto flex flex-col items-center justify-center">
            <h1 class="text-8xl text-primary-500 font-bold">{{ error?.statusCode }}</h1>
            <p v-if="error?.message" class="text-3xl">{{ error?.message }}</p>
            <p v-else class="text-3xl">An error occurred</p>
            <NuxtLink to="/" class="mt-2 text-primary-600 hover:underline hover:text-primary-400">Go back home</NuxtLink>
        </div>
    </NuxtLayout>
</template>
