<template>
    <div class="font-mono margin-min-10 mx-6 lg:mx-auto lg:w-4/5 xl:md-3/5">
        <h1 class="text-5xl w-fit mx-auto">Leaderboard</h1>
        <p class="w-fit mt-1 mx-auto">Most active AllChat users</p>
        <p class="mt-6 text-gray-600 mx-auto w-fit">Please note that stats are updated every 12 hours</p>
        <UButton @click="refresh"
            class="text-primary-500 hover:text-primary-800 mt-4 text-sm w-fit cursor-pointer" variant="link">
            Refresh
        </UButton>
        <UDivider class="mt-4" />
        <div v-if="data" class="flex flex-col items-center justify-between w-full gap-4">
            <div v-if="data.leaderboard"
                class="flex flex-col md:flex-row items-center md:items-start mt-6 justify-between w-full gap-8 md:gap-4 xl:gap-12 [&>div]:shadow-xl [&>div]:bg-gray-100 [&>div]:dark:bg-gray-900 [&>div]:py-4 [&>div]:rounded-xl [&>div]:px-8">
                <LeaderboardList :leaderboard="data.leaderboard.messages" header="Most messages sent" />
                <LeaderboardList :leaderboard="data.leaderboard.discoveredRooms" header="Most rooms discovered" />
                <LeaderboardList :leaderboard="data.leaderboard.joinedRooms" header="Most rooms joined" />
            </div>
            <div v-else>
                <USkeleton />
            </div>
        </div>
        <div v-else>
            <h2 class="text-3xl">Loading leaderboard...</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
        </div>
    </div>
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

const { data, refresh } = useFetch('/api/leaderboard');
</script>

<style scoped>
.margin-min-10 {
    margin-top: min(2.5rem, 7rem);
    margin-bottom: min(1.5rem, 7rem);
}
</style>