<template>
    <div
        class="flex flex-col items-center justify-center gap-2 w-[26rem] px-8 py-4 bg-neutral-100 dark:bg-neutral-950/90 rounded-xl">
        <h2 class="self-start text-lg font-bold text-primary-500">{{ $t('generic.room') + ' ' + room.substring(0, 8) + ' ' + $t('generic.stats') }}</h2>
        <p class="text-neutral-500 text-sm text-start">{{ $t('room.statsNote') }}</p>
        <USeparator />
        <table v-if="data.stats" class="w-full table-fixed [&>*>tr>td]:py-1">
            <tbody>
                <tr>
                    <td class="font-bold">{{ $t('room.discoveredBy') }}:</td>
                    <td v-if="discover">{{ discover.username }}</td>
                    <td v-else>{{ $t('generic.unknown') }}</td>
                </tr>
                <tr>
                    <td class="font-bold">{{ $t('room.discoveredAt') }}:</td>
                    <td v-if="discover">{{ discover.discoveredAt }}</td>
                    <td v-else>{{ $t('generic.unknown') }}</td>
                </tr>
                <tr>
                    <td class="font-bold">{{ $t('room.msgCount') }}:</td>
                    <td>{{ data.stats.totalMessages }}</td>
                </tr>
                <tr>
                    <td class="font-bold">{{ $t('room.totalViews') }}:</td>
                    <td>{{ data.stats.totalViews }}</td>
                </tr>
                <tr>
                    <td class="font-bold">{{ $t('room.usersJoined') }}:</td>
                    <td>{{ data.stats.totalUniqueUsers }}</td>
                </tr>
                <tr>
                    <td class="font-bold">{{ $t('room.usersInteracted') }}:</td>
                    <td>{{ data.stats.totalUniqueMessageSenders }}</td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            <p>{{ $t('room.loadingStats') }}</p>
            <UIcon name="i-mdi-loading" class="animate-spin" />
        </div>
        <UButton @click="$emit('close')" class="text-neutral-100 hover:text-neutral-300 dark:text-neutral-400" color="neutral"
            variant="link">
            {{ $t('generic.close') }}
        </UButton>
    </div>
</template>

<script setup>
const props = defineProps({
    room: {
        type: String,
        required: true,
    },
    discover: {
        type: Object,
        required: true,
    },
});

const { room, discover } = toRefs(props);
const { data } = await useFetch(`/api/room/${room.value}/stats`);
if (!discover.value) {
    await $fetch(`/api/room/${room.value}/discoverer`).then((res) => {
        if (res.code === 200) {
            discover.value = res.discover;
        } else {
            // fix this - prop is readonly
            discover.value = { username: 'Unknown', discoveredAt: 'Unknown' };
        }
    });
}
</script>