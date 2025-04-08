<template>
    <div class="font-mono relative margin-min-10 mx-6 lg:mx-auto lg:w-4/5 xl:md-3/5">
        <div class="flex flex-col items-center relative justify-center w-fit mx-auto">
            <h1 class="text-5xl w-fit">{{ $t('leaderboard.title') }}</h1>
            <p class="w-fit mt-1">{{ $t('leaderboard.description') }}</p>
            <p class="mt-6 text-neutral-600 w-fit">{{ $t('leaderboard.note') }}</p>
        </div>
        <UButton @click="tryRefresh" class="text-primary-500 hover:text-primary-800 mt-4 text-sm absolute left-1/2 -translate-x-1/2 top-14 md:left md:right-4 w-fit cursor-pointer"
            variant="link" :disabled="!canRefresh">
            {{ $t('generic.refresh') }}
        </UButton>
        <USeparator class="mt-4" />
        <div v-if="data" class="flex flex-col items-center justify-between w-full gap-4">
            <div v-if="data.leaderboard"
                class="flex flex-col md:flex-row items-center md:items-start mt-6 justify-between w-full gap-8 md:gap-4 xl:gap-12">
                <LeaderboardList :leaderboard="data.leaderboard.messages" :header="$t('leaderboard.messagesHeader')" />
                <LeaderboardList :leaderboard="data.leaderboard.discoveredRooms" :header="$t('leaderboard.discovererHeader')" />
                <LeaderboardList :leaderboard="data.leaderboard.joinedRooms" :header="$t('leaderboard.joinedHeader')" />
            </div>
            <div v-else>
                <USkeleton />
            </div>
        </div>
        <div class="flex flex-col items-center justify-center" v-else>
            <h2 class="text-3xl">{{ $t('leaderboard.loading') }}</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    description: 'Check out the top users in AllChat!',
    middleware: 'auth',
});

const { t } = useI18n();
useHead({
    title: t('leaderboard.title'),
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