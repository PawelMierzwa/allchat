<template>
    <UContainer class="flex flex-col items-center justify-between pt-32 md:p-32">
        <h1 class="text-5xl" v-if="data">{{ data.username + "'s" }} profile</h1>
        <h1 class="text-5xl" v-else>Loading...</h1>
        <div class="flex flex-col items-center justify-between mt-10 w-full" v-if="data">
            <div class="flex items-center gap-4">
                <UAvatar :src="useRuntimeConfig().public.imgUrl + id + '.webp'" :alt="data.username.toUpperCase()" size="2xl" />
                <div>
                    <h2 class="text-2xl">{{ data.username }}</h2>
                </div>
            </div>
            <UDivider class="my-4 w-1/2" />
            <div v-if="data.stats" class="flex flex-col items-center justify-between p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
                <h3 class="text-xl">Stats</h3>
                <table class="[&>*>tr>td]:p-2 w-full h-full">
                    <tbody>
                        <tr>
                            <td class="font-bold">Messages sent:</td>
                            <td>{{ data.stats.totalMessages }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold">Rooms created:</td>
                            <td>{{ data.stats.totalRoomsDiscovered }}</td>
                        </tr>
                        <tr>
                            <td class="font-bold">Rooms joined:</td>
                            <td>{{ data.stats.totalRoomsJoined }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="data.message" class="text-center">
                <p>Error fetching user data</p>
                <p class="text-red-300">{{ data.code }}, {{ data.message }}</p>
            </div>
        </div>
        <div v-else>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
        </div>
    </UContainer>
</template>

<script setup>
definePageMeta({
    middleware: 'auth',
});

const route = useRoute();
const { id } = route.params;
const { data } = await useFetch('/api/user/' + id + '/stats');
</script>