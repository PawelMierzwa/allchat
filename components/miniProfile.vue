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
        class="flex flex-col items-center justify-center relative gap-4 w-80 px-12 py-4 bg-neutral-100 dark:bg-neutral-950/90 rounded-xl">
        <NuxtLink class="flex flex-row items-center justify-between w-full gap-4 p-2" color="neutral"
            :to="'/user/' + user.id">
            <h2 class="self-start font-bold">{{ user.name }}</h2>
            <UIcon name="i-mdi-account" />
        </NuxtLink>
        <table v-if="data.stats" class="[&>*>tr>td]:px-2">
            <tbody>
                <tr>
                    <td>{{ $t('profile.messages') }}</td>
                    <td>{{ data.stats.totalMessages }}</td>
                </tr>
                <tr>
                    <td>{{ $t('profile.sentInRoom') }}</td>
                    <td>{{ data.stats.totalRoomMessages }}</td>
                </tr>
                <tr>
                    <td>{{ $t('profile.rooms') }}</td>
                    <td>{{ data.stats.totalRoomsDiscovered }}</td>
                </tr>
                <tr>
                    <td>{{ $t('profile.joined') }}</td>
                    <td>{{ data.stats.totalRoomsJoined }}</td>
                </tr>
            </tbody>
        </table>
        <div v-else-if="data.message" class="text-center">
            <p>{{ $t('profile.error') }}</p>
            <p class="text-red-300">{{ data.message }}</p>
        </div>
        <div v-else>
            <p>{{ $t('profile.loadingStats') }}</p>
            <UIcon name="i-mdi-loading" class="animate-spin" />
        </div>
        <UButton @click="$emit('close')" class="text-neutral-100 hover:text-neutral-300 dark:text-neutral-400" color="neutral"
            variant="link">{{ $t('generic.close') }}</UButton>
    </UContainer>
</template>