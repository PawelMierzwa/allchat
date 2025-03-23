<template>
    <UContainer class="flex flex-col justify-between my-auto font-mono">
        <h1 class="text-5xl text-center">{{ $t('profile.title') }}</h1>
        <div
            class="flex flex-col items-center justify-between mt-10 w-full p-8 bg-neutral-100 dark:bg-neutral-900 rounded-md">
            <div class="flex flex-row items-center justify-between lg:gap-16 md:gap-8 gap-4">
                <div>
                    <div class="flex items-center gap-4">
                        <UAvatar :src="useRuntimeConfig().public.imgUrl + user.id + '.webp'"
                            :alt="user.name.toUpperCase()" size="3xl" />
                        <div>
                            <h2 class="text-3xl">{{ user.name }}</h2>
                            <p class="text-neutral-500">{{ user.email }}</p>
                        </div>
                    </div>
                </div>
                <UButton variant="link" to="/settings#Account">{{ $t('profile.edit') }}</UButton>
            </div>
            <USeparator class="my-4 w-1/2" />
            <div v-if="data.stats" class="flex flex-col items-center justify-between">
                <h3 class="text-xl">{{ $t('profile.stats') }}</h3>
                <table class="[&>*>tr>td]:p-2 w-full h-full">
                    <tbody>
                        <tr>
                            <td class="font-bold">{{ $t('profile.messages') }}:</td>
                            <td>{{ data.stats.totalMessages }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold">{{ $t('profile.rooms') }}:</td>
                            <td>{{ data.stats.totalRoomsDiscovered }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold">{{ $t('profile.joined') }}:</td>
                            <td>{{ data.stats.totalRoomsJoined }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="data.message" class="text-center">
                <p>{{ $T('profile.error') }}</p>
                <p class="text-red-300">{{ data.code }}, {{ data.message }}</p>
            </div>
        </div>
    </UContainer>
</template>

<script setup>
const sessionStore = useSessionStore();
const user = computed(() => sessionStore.user);

definePageMeta({
    middleware: 'auth',
});

useHead({
    title: 'Your profile',
});

const { data, error } = await useFetch('/api/user/' + user.value.id + '/stats?size=lg');
</script>