<template>
    <UContainer class="font-mono md:p-28 pt-28">
        <h1 class="text-5xl w-fit mx-auto">Leaderboard</h1>
        <div class="flex flex-col items-center justify-between mx-auto mt-10 w-full gap-4">
            <UDivider />
            <div class="flex flex-col md:flex-row items-center md:items-start mt-8 justify-between w-full gap-12 [&>div]:bg-gray-100 [&>div]:dark:bg-gray-900 [&>div]:py-4 [&>div]:rounded-xl [&>div]:px-8">
                <div class="flex flex-col items-center justify-between w-full gap-4 ring-1 ring-primary-500">
                    <h2 class="text-2xl">Most messages sent</h2>
                    <div v-for="(user, index) in data.leaderboard.messages" :key="index"
                        class="flex flex-row items-center justify-between w-full gap-4">
                        <p class="text-lg">{{ user.username }}</p>
                        <p class="text-lg">{{ user.count }}</p>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-between w-full gap-4 ring-1 ring-primary-500">
                    <h2 class="text-2xl">Most discovered rooms </h2>
                    <div v-for="(user, index) in data.leaderboard.discoveredRooms" :key="index"
                        class="flex flex-row items-center justify-between w-full gap-4">
                        <p class="text-lg">{{ user.username }}</p>
                        <p class="text-lg">{{ user.count }}</p>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-between w-full gap-4 ring-1 ring-primary-500">
                    <h2 class="text-2xl">Most rooms joined</h2>
                    <div v-for="(user, index) in data.leaderboard.joinedRooms" :key="index"
                        class="flex flex-row items-center justify-between w-full gap-4">
                        <p class="text-lg">{{ user.username }}</p>
                        <p class="text-lg">{{ user.count }}</p>
                    </div>
                </div>
            </div>
        </div>
    </UContainer>
</template>

<script setup>
const { data } = useFetch('/api/leaderboard');
</script>