<script setup>
const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
});

const { user, room } = toRefs(props);

const { data } = await useFetch(`/api/user/${user.value.id}/stats?room=${room.value}`);
</script>

<template>
    <UContainer
        class="flex flex-col items-center justify-center relative gap-4 w-80 px-12 py-4 bg-gray-100 dark:bg-gray-950/90 rounded-xl">
        <NuxtLink class="flex flex-row items-center justify-between w-full gap-4 p-2" color="gray"
            :to="'/user/' + user.id">
            <h2 class="self-start font-bold">{{ user.name }}</h2>
            <UIcon name="i-mdi-account" />
        </NuxtLink>
        <table v-if="data.stats" class="[&>*>tr>td]:px-2">
            <tbody>
                <tr>
                    <td>Messages sent</td>
                    <td>{{ data.stats.totalMessages }}</td>
                </tr>
                <tr>
                    <td>Messages sent in this room</td>
                    <td>{{ data.stats.totalRoomMessages }}</td>
                </tr>
                <tr>
                    <td>Rooms created</td>
                    <td>{{ data.stats.totalRoomsDiscovered }}</td>
                </tr>
                <tr>
                    <td>Rooms joined</td>
                    <td>{{ data.stats.totalRoomsJoined }}</td>
                </tr>
            </tbody>
        </table>
        <div v-else-if="data.message" class="text-center">
            <p>Error fetching user data</p>
            <p class="text-red-300">{{ data.message }}</p>
        </div>
        <div v-else>
            <p>Loading user data...</p>
            <UIcon name="i-mdi-loading" class="animate-spin" />
        </div>
        <UButton @click="$emit('close')" class="text-gray-100 hover:text-gray-300 dark:text-gray-400" color="gray"
            variant="link">Close</UButton>
    </UContainer>
</template>