<template>
    <UContainer class="md:px-28 flex flex-col items-center justify-center font-mono w-full">
        <h1 class="text-xl mb-4 mt-4">Room {{ $route.params.id.slice(0, 8) }}</h1>
        <UContainer
            class="px-4 w-11/12 md:w-4/5 lg:w-3/5 max-w-auto py-6 relative bg-gray-100 dark:bg-gray-900 flex flex-col gap-4 rounded-lg h-[70vh] shadow-lg ">
            <!-- chat history -->
            <div ref="messagesContainer" class="overflow-y-auto h-full flex flex-col gap-4">
                <div v-if="messages.length > 0" v-for="msg in messages" :key="msg.sender.id + msg.content"
                    :class="user.id === msg.sender.id ? 'self-end text-end' : ''" class="flex flex-col gap-1">
                    <div :class="user.id === msg.sender.id ? 'flex-row-reverse' : 'flex-row'"
                        class="flex gap-2 items-center">
                        <UAvatar :src="'https://i.pravatar.cc/32?u='+msg.sender.id" />
                        <span class="font-bold w-fit">{{ msg.sender.name }}</span>
                    </div>
                    <p :class="user.id === msg.sender.id ? 'mr-6' : ''" class="ml-6 mr-0 break-all">
                        {{ msg.content }}
                    </p>
                </div>
                <div v-else class="text-center text-gray-500">
                    No messages yet.<br>
                    Be the first to send a message in this chat!
                </div>
            </div>
            <UInput v-model="message" placeholder="Type a message..." @keyup.enter="sendMessage"
                :ui="{ icon: { trailing: { pointer: '' } } }" maxlength="256" class="w-full mt-auto">
                <template #trailing>
                    <UButton color="gray" variant="link" icon="i-mdi-send" :padded="false" @click="sendMessage" />
                </template>
            </UInput>
        </UContainer>
        <UContainer v-if="wsDisconnected" class="absolute top-0 left-0 w-full h-full bg-gray-900/70 flex flex-col items-center justify-center">
            <div class="h-80 w-80">
                Connection has been lost.
                <UButton @click="connect" color="gray" variant="link" class="mt-4">Reconnect</UButton>
            </div>
        </UContainer>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            message: '',
            ws: null,
            gameId: '',
            wsDisconnected: false,
        }
    },
    setup() {
        const route = useRoute();
        const sessionStore = useSessionStore();
        const user = computed(() => sessionStore.user);
        const messages = ref([]);

        definePageMeta({
            middleware: 'auth',
        })

        async function fetchRoomHistory() {
            const { data, error } = await useFetch('/api/room/' + route.params.id);
            if (error.value) {
                console.error('Failed to fetch room history:', error.value);
                const toast = useToast();
                toast.add({ title: 'Failed to fetch room history', message: error.value.message, variant: 'error' });
            } else {
                console.log('Room history:', data.value);
                messages.value = data.value.messages;
            }
        }

        useHead({
            title: route.params.id.slice(0, 8),
        });

        try {
            fetchRoomHistory();
        } catch (error) {
            const toast = useToast();
            toast.add({ title: 'Failed to fetch room history', message: error, variant: 'error' });
            console.error('Failed to fetch room history:', error);
        }
        return { user, messages };
    },
    mounted() {
        this.gameId = this.$route.params.id;
        const toast = useToast();

        try {
            this.connect();
        } catch (error) {
            console.error('Failed to connect to chat:', error);
            toast.add({ title: 'Failed to connect to chat', message: error, variant: 'error' });
        }
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
                this.wsDisconnected = false;
                this.ws.send(JSON.stringify({
                    action: 'join',
                    room_id: this.gameId,
                }));
            });

            this.ws.addEventListener("close", () => {
                this.wsDisconnected = true;
                console.log("ws", "Disconnected!");
            });

            this.ws.addEventListener("message", async (event) => {
                let data = typeof event.data === "string" ? event.data : await event.data.text();
                const messageData = JSON.parse(data);

                if (messageData.content && messageData.sender) {
                    console.log(`[${messageData.sender}] ${messageData.content}`);
                    // Update chat history
                    this.messages.push({
                        sender: messageData.sender,
                        content: messageData.content,
                    });
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
                    this.messages.push({
                        sender: {
                            id: this.user.id,
                            name: this.user.name,
                        },
                        content: this.message,
                    });
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