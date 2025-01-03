<template>
    <UContainer class="md:px-28 flex flex-col items-center justify-center font-mono w-full">
        <h1 class="text-xl mb-4 mt-4">Room {{ gameId.slice(0, 8) }}</h1>
        <UContainer
            class="px-4 w-11/12 md:w-4/5 lg:w-3/5 max-w-auto py-6 relative bg-gray-100 dark:bg-gray-900 flex flex-col gap-4 rounded-lg h-[70vh] shadow-lg ">
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
            }],
            ws: null,
            gameId: null,
        }
    },
    setup() {
        const route = useRoute();
        const sessionStore = useSessionStore();
        const user = computed(() => sessionStore.user);

        async function fetchRoomHistory() {
            useFetch('/api/room/' + route.params.id, {
                onSuccess(data) {
                    console.log('Room history:', data);
                    this.messages = data.messages;
                },
                onError(error) {
                    console.error('Failed to fetch room history:', error);
                },
            });
        }

        useHead({
            title: route.params.id.slice(0, 8),
        });

        return { user, fetchRoomHistory };
    },
    mounted() {
        this.gameId = this.$route.params.id;
        this.connect();
        this.fetchRoomHistory();
    },
    beforeUnmount() {
        if (this.ws) {
            this.ws.close();
        }
    },
    methods: {
        async connect() {
            const isSecure = location.protocol === "https:";
            const url = (isSecure ? "wss://" : "ws://") + location.host + "/chatroom";
            if (this.ws) {
                console.log("ws", "Closing previous connection before reconnecting...");
                this.ws.close();
            }

            console.log("ws", "Connecting to", url, "...");
            this.ws = new WebSocket(url);

            this.ws.addEventListener("open", () => {
                console.log("ws", "Connected!");
                this.ws.send(JSON.stringify({
                    action: 'join',
                    room_id: this.gameId,
                }));
            });
            this.ws.addEventListener("message", async (event) => {
                let data = typeof event.data === "string" ? event.data : await event.data.text();
                const messageData = JSON.parse(data);

                if (messageData.content && messageData.sender) {
                    console.log(`[${messageData.sender}] ${messageData.content}`);
                    // Update chat history
                    this.history = this.history || {};
                    const msgId = Object.keys(this.history).length + 1;
                    this.messages[msgId] = {
                        sender: messageData.sender,
                        content: messageData.content,
                    };
                    nextTick(() => {
                        const chatContainer = document.getElementById('chat');
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    });
                } else if (messageData.status === 'joined') {
                    console.log(`Joined room ${messageData.room_id}`);
                } else if (messageData.status === 'left') {
                    console.log(`Left room ${messageData.room_id}`);
                } else if (messageData.error) {
                    console.error("Server error:", messageData.error);
                }
            });
        },
        sendMessage() {
            if (this.message.trim() === '') return;
            if (this.message.length > 0) {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        action: 'message',
                        room_id: this.gameId,
                        content: this.message,
                        sender: {
                            id: this.user.id,
                            name: this.user.name,
                        },
                    }));
                    // Update local chat history
                    this.messages = this.messages || {};
                    const msgId = Object.keys(this.messages).length + 1;
                    this.messages[msgId] = {
                        sender: {
                            id: this.user.id,
                            name: this.user.name,
                        },
                        content: this.message,
                    };
                    this.message = '';
                    this.$nextTick(() => {
                        const container = this.$refs.messagesContainer;
                        container.scrollTop = container.scrollHeight;
                    });
                } else {
                    console.error('WebSocket is not connected.');
                }
            }
        },
    },
}
</script>