<template>
    <div class="font-mono relative margin-min-10 mx-6 lg:mx-auto lg:w-4/5 xl:md-3/5">
        <div class="flex flex-col items-center relative justify-center w-fit mx-auto">
            <h1 class="text-5xl w-fit">Leaderboard</h1>
            <p class="w-fit mt-1">Most active AllChat users</p>
            <p class="mt-6 text-gray-600 w-fit">Please note that stats are updated every 12 hours</p>
        </div>
        <UButton @click="tryRefresh" class="text-primary-500 hover:text-primary-800 mt-4 text-sm absolute left-1/2 -translate-x-1/2 top-14 md:left md:right-4 w-fit cursor-pointer"
            variant="link" :disabled="!canRefresh">
            Refresh
        </UButton>
        <UDivider class="mt-4" />
        <div v-if="data" class="flex flex-col items-center justify-between w-full gap-4">
            <div v-if="data.leaderboard"
                class="flex flex-col md:flex-row items-center md:items-start mt-6 justify-between w-full gap-8 md:gap-4 xl:gap-12">
                <LeaderboardList :leaderboard="data.leaderboard.messages" header="Most messages sent" />
                <LeaderboardList :leaderboard="data.leaderboard.discoveredRooms" header="Most rooms discovered" />
                <LeaderboardList :leaderboard="data.leaderboard.joinedRooms" header="Most rooms joined" />
            </div>
            <div v-else>
                <USkeleton />
            </div>
        </div>
        <div class="flex flex-col items-center justify-center" v-else>
            <h2 class="text-3xl">Loading leaderboard...</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    description: 'Check out the top users in AllChat!',
    middleware: 'auth',
});

useHead({
    title: 'Leaderboard',
});

const { data, refresh } = useFetch('/api/leaderboard');
const canRefresh = ref(true);
const refreshTimeout = ref(null);

function tryRefresh() {
    if (canRefresh.value) {
        canRefresh.value = false;
        refresh();
        refreshTimeout.value = setTimeout(() => {
            canRefresh.value = true;
        }, 10000);
    }
}

</script>

<style scoped>
.margin-min-10 {
    margin-top: min(2.5rem, 7rem);
    margin-bottom: min(1.5rem, 7rem);
}
</style>