<template>
    <UContainer class="font-mono md:p-32 pt-32 flex flex-col items-center">
        <h1 class="text-5xl w-fit mx-auto">{{ $t('about.title') }}</h1>
        <div class="flex flex-col items-center justify-between mx-auto mt-10 w-1/2 gap-4">
            <p>
                {{ $t('about.description') }}
            </p>
            <p>
                {{ $t('about.features') }}
            </p>
        </div>
        <div class="flex flex-col items-center justify-between mt-10 md:w-1/2 gap-4">
            <p>{{ $t('about.sourceAvailable') }}, {{ $t('about.withIts') }} <NuxtLink to="https://github.com/pawelmierzwa/allchat" class="underline hover:text-neutral-400">{{ $t('about.sourceCode') }}</NuxtLink></p>
        </div>
    </UContainer>
</template>

<script setup>
const { t } = useI18n();
useHead({
    title: t('about.title'),
});

useSeoMeta({
    title: 'About',
    description: 'Learn more about AllChat.',
});
</script>