<template>
    <div class="flex flex-col items-center justify-between w-full gap-4">
        <h2 class="text-xl">{{ header }}</h2>
        <ul v-if="leaderboardEntries.length > 0"
            class="flex flex-col list-none items-center justify-between divide-y w-full overflow-y-auto divide-neutral-600 divide-dashed shadow-xl bg-neutral-100 dark:bg-neutral-900 py-6 rounded-xl px-8">
            <li v-for="(user, index) in leaderboardEntries" :key="index" :title="user.username + `'s profile`"
                @click="openProfile(user)"
                class="flex flex-row items-center rounded hover:bg-neutral-400/70 hover:dark:bg-neutral-800/70 transition justify-between w-full gap-4 p-2 cursor-pointer">
                <p class="text-md">{{ user.username }}</p>
                <p class="text-md">{{ user.count }}</p>
            </li>
        </ul>
        <div v-else>
            <USkeleton />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    leaderboard: {
        type: Object,
        required: true
    },
    header: {
        type: String,
        required: true
    }
});

const { leaderboard: leaderboardEntries, header } = toRefs(props);

const router = useRouter();
const openProfile = function (user) {
    router.push('/user/' + user.id);
}
</script>

<style scoped>
ul.dynamic-height {
    max-height: 300px;
    overflow-y: auto;
}
</style>