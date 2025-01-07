<template>
    <div
        class="flex flex-col items-center justify-center gap-2 h-96 w-[26rem] px-8 py-4 bg-gray-100 dark:bg-gray-950/90 rounded-xl">
        <h2 class="self-start text-lg font-bold text-primary-500">Room {{ room.substring(0, 8) }} stats</h2>
        <p class="text-gray-500 text-sm text-start">Please note that the statistics are updated every few hours.</p>
        <UDivider />
        <table v-if="data.stats" class="w-full table-fixed [&>*>tr>td]:py-1">
            <tbody>
                <tr>
                    <td class="font-bold">Room discovered by:</td>
                    <td>{{ discover.username }}</td>
                </tr>
                <tr>
                    <td class="font-bold">Discovered at:</td>
                    <td>{{ discover.discoveredAt }}</td>
                </tr>
                <tr>
                    <td class="font-bold">Message count:</td>
                    <td>{{ data.stats.totalMessages }}</td>
                </tr>
                <tr>
                    <td class="font-bold">Total room views:</td>
                    <td>{{ data.stats.totalViews }}</td>
                </tr>
                <tr>
                    <td class="font-bold">Users joined:</td>
                    <td>{{ data.stats.totalUniqueUsers }}</td>
                </tr>
                <tr>
                    <td class="font-bold">Users that interacted:</td>
                    <td>{{ data.stats.totalUniqueMessageSenders }}</td>
                </tr>
            </tbody>
        </table>
        <div v-else>
            <p>Loading room stats...</p>
            <UIcon name="i-mdi-loading" class="animate-spin" />
        </div>
        <UButton @click="$emit('close')" class="text-gray-100 hover:text-gray-300 dark:text-gray-400" color="gray"
            variant="link">Close</UButton>
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
</script>