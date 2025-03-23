<template>
    <div
        class="px-12 py-8 bg-neutral-100 dark:bg-neutral-950/90 rounded-xl z-50 flex flex-col items-center gap-4 justify-between">
        <h2 class="text-2xl text-primary-500">{{ $t('rules.header') }}</h2>
        <ul class="list-disc list-inside">
            <li>{{ $t('rules.enterPassphrase') }}</li>
            <li>{{ $t('rules.sharePassphrase') }}</li>
            <li>{{ $t('rules.beCareful') }}</li>
            <li>{{ $t('rules.topic') }}</li>
            <li>{{ $t('rules.restrictions') }}</li>
            <li>{{ $t('rules.forget') }}</li>
            <li>{{ $t('rules.haveFun') }}</li>
        </ul>
        <UButton @click="$emit('close')" variant="link" class="self-end cursor-pointer hover:underline transition-none">
            {{ $t('generic.close') }}
        </UButton>
    </div>
</template>