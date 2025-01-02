<template>
    <UContainer class="px-28 flex flex-col items-center justify-center font-mono w-full">
        <h1 class="text-xl mb-4 mt-10">Room {{ $route.params.id.slice(0, 8) }}</h1>
        <UContainer
            class="px-4 w-3/5 py-6 relative bg-gray-100 dark:bg-gray-900 flex flex-col gap-4 rounded-lg lg:h-[600px] shadow-lg ">
            <!-- chat history -->
            <div ref="messagesContainer" class="overflow-y-auto h-full flex flex-col gap-4">
                <div v-for="msg in messages" :key="msg.sid" :data-user="msg.sid"
                    class="data-[user=0]:self-end data-[user=0]:text-end flex flex-col gap-1">
                    <div :data-user="msg.sid" class="flex data-[user=0]:flex-row-reverse flex-row gap-2 items-center">
                        <UAvatar src="https://i.pravatar.cc/32" />
                        <span class="font-bold w-fit">{{ msg.sender }}</span>
                    </div>
                    <p :data-user="msg.sid" class="ml-6 mr-0 data-[user=0]:mr-6 break-all">{{ msg.text }}</p>
                </div>
            </div>
            <UInput v-model="message" placeholder="Type a message..." @keyup.enter="sendMessage"
                :ui="{ icon: { trailing: { pointer: '' } } }" maxlength="256" class="w-full mt-auto">
                <template #trailing>
                    <UButton color="gray" variant="link" icon="i-mdi-send" :padded="false" @click="sendMessage" />
                </template>
            </UInput>
        </UContainer>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            message: '',
            messages: [{
                sid: 1,
                sender: 'John Doe',
                text: 'Hello, world!'
            }, {
                sid: 2,
                sender: 'Jane Doe',
                text: 'Hi, John!'
            }]
        }
    },
    setup() {
        const route = useRoute();
        useHead({
            title: route.params.id.slice(0, 8),
        });
    },
    methods: {
        sendMessage() {
            if (this.message.trim() === '') return;
            console.log(this.message);
            this.messages.push({
                sid: 0,
                sender: 'Michael Smith',
                text: this.message
            });
            this.message = '';
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                container.scrollTop = container.scrollHeight;
            });
        }
    }
}
</script>