<template>
    <UContainer class="font-mono md:p-28 pt-28">
        <h1 class="text-5xl w-fit mx-auto">Leaderboard</h1>
        <p class="w-fit mt-1 mx-auto">Most active AllChat users</p>
        <p class="mt-6 text-gray-600 mx-auto w-fit">Please note that stats are updated every 12 hours</p>
        <UDivider class="mt-4" />
        <div v-if="data" class="flex flex-col items-center justify-between mx-auto w-full gap-4">
            <div v-if="data.leaderboard"
                class="flex flex-col md:flex-row items-center md:items-start mt-6 justify-between w-full gap-12 [&>div]:shadow-xl [&>div]:bg-gray-100 [&>div]:dark:bg-gray-900 [&>div]:py-4 [&>div]:rounded-xl [&>div]:px-8">
                <div class="flex flex-col items-center justify-between w-full gap-4">
                    <h2 class="text-xl">Most messages sent</h2>
                    <div
                        class="flex flex-col items-center justify-between divide-y w-full divide-gray-600 divide-dashed">
                        <div v-for="(user, index) in data.leaderboard.messages" :key="index" @click="openProfile(user.id)"
                            class="flex flex-row items-center justify-between w-full gap-4 p-2 cursor-pointer">
                            <p class="text-md">{{ user.username }}</p>
                            <p class="text-md">{{ user.count }}</p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-between w-full gap-4">
                    <h2 class="text-xl">Most discovered rooms </h2>
                    <div
                        class="flex flex-col items-center justify-between divide-y w-full divide-gray-600 divide-dashed">
                        <div v-for="(user, index) in data.leaderboard.discoveredRooms" :key="index" @click="openProfile(user.id)"
                            class="flex flex-row items-center justify-between w-full gap-4 p-2 cursor-pointer">
                            <p class="text-md">{{ user.username }}</p>
                            <p class="text-md">{{ user.count }}</p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-between w-full gap-4">
                    <h2 class="text-xl">Most rooms joined</h2>
                    <div
                        class="flex flex-col items-center justify-between divide-y w-full divide-gray-600 divide-dashed">
                        <div v-for="(user, index) in data.leaderboard.joinedRooms" :key="index" @click="openProfile(user.id)"
                            class="flex flex-row items-center justify-between w-full gap-4 p-2 cursor-pointer">
                            <p class="text-md">{{ user.username }}</p>
                            <p class="text-md">{{ user.count }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <USkeleton />
            </div>
        </div>
        <div v-else>
            <h2 class="text-3xl">Loading leaderboard...</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
        </div>
    </UContainer>
</template>

<script setup>
definePageMeta({
    title: 'Leaderboard',
    description: 'Check out the top users in AllChat!',
    middleware: 'auth',
});

const router = useRouter();

const openProfile = function (id) {
    router.push('/user/' + id);
}

const { data } = useFetch('/api/leaderboard');
</script>