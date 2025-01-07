<template>
    <div class="flex flex-col items-center justify-between w-full gap-4">
        <h2 class="text-xl">{{ header }}</h2>
        <ul
            class="flex flex-col px-2 list-none items-center justify-between divide-y w-full overflow-y-auto dynamic-height divide-gray-600 divide-dashed">
            <li v-for="(user, index) in leaderboardEntries" :key="index" @click="openProfile(user.id)"
                class="flex flex-row items-center hover:bg-gray-500/70 transition justify-between w-full gap-4 p-2 cursor-pointer">
                <p class="text-md">{{ user.username }}</p>
                <p class="text-md">{{ user.count }}</p>
            </li>
        </ul>
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
const openProfile = function (id) {
    router.push('/user/' + id);
}
</script>

<style scoped>
::-webkit-scrollbar {
    width: 3px;
    height: 12px;
}

::-webkit-scrollbar-track {
    background: theme('colors.gray.800');
}

::-webkit-scrollbar-thumb {
    background: theme('colors.gray.600');
    border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
    background: theme('colors.orange.600');
}

ul.dynamic-height {
    /* scrollbar-width: thin;
    scrollbar-color: theme('colors.gray.600') theme('colors.gray.900');
    scrollbar-arrow-color: theme('colors.gray.900'); */

    max-height: 300px;
    overflow-y: auto;
}

@media screen and (max-height: 750px) {
    ul.dynamic-height {
        max-height: 240px;
    }
}

</style>