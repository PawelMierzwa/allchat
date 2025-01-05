<template>
    <UContainer class="flex flex-col items-center justify-between pt-32 md:p-32">
        <h1 class="text-5xl">Your Profile</h1>
        <div class="flex flex-col items-center justify-between mt-10 w-full">
            <div class="flex items-center gap-4">
                <UAvatar :src="'https://i.pravatar.cc/64?u=' + user.id" size="lg" />
                <div>
                    <h2 class="text-2xl">{{ user.name }}</h2>
                    <p class="text-gray-500">{{ user.email }}</p>
                </div>
            </div>
            <UDivider class="my-4 w-1/2" />
            <div v-if="data.stats" class="flex flex-col items-center justify-between p-4 bg-gray-900 rounded-md">
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
    </UContainer>
</template>

<script setup>
const sessionStore = useSessionStore();
const user = computed(() => sessionStore.user);

definePageMeta({
    middleware: 'auth',
});

const { data, error } = await useFetch('/api/user/' + user.value.id + '/stats?size=lg');
</script>