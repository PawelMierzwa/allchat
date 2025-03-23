<template>
    <div class="flex flex-col mx-auto px-0 items-center w-full md:w-4/5 lg:w-3/5 my-auto font-mono">
        <div class="w-full items-center relative justify-center flex gap-4">
            <h1 class="text-xl mb-4 mt-4">Room {{ $route.params.id.slice(0, 8) }}</h1>
            <div v-if="passphraseCache" class="absolute flex items-center right-0">
                <UButton @click="showRoomStats = true" size="sm" class="w-8 h-8" color="neutral" icon="i-mdi-chart-bar"
                    variant="link" />
            </div>
        </div>
        <div v-if="passphraseCache"
            class="px-2 md:px-4 w-full py-6 relative bg-neutral-100 dark:bg-neutral-900 h-[70vh] flex flex-col gap-4 rounded-lg shadow-lg ">
            <div ref="messagesContainer" @scroll="handleScroll"
                class="overflow-y-auto overflow-x-hidden h-full scrollbar flex flex-col gap-4 px-2">
                <div v-if="isLoadingMessages" class="flex justify-center py-2">
                    <UIcon name="i-mdi-loading" class="animate-spin text-xl text-neutral-500" />
                </div>
                <div v-else-if="discover" class="text-center text-neutral-500 text-sm">
                    <p>Room discovered by {{ discover.username }} at {{ discover.discoveredAt }}</p>
                </div>
                <div v-if="messages.length > 0" class="flex flex-col gap-4">
                    <template v-for="(msg, index) in messages" :key="msg.id" class="w-full">
                        <div v-if="shouldShowDateDivider(index)" class="text-center text-neutral-500 text-sm rounded-sm">
                            <UDivider :label="formatDateDivider(messages[index].createdAt)" class="text-neutral-500"
                                :ui="{ label: 'text-neutral-500 dark:text-neutral-600' }" />
                        </div>
                        <div :class="user.id === msg.sender.id ? 'self-end text-end' : ''"
                            class="flex flex-col gap-1 rounded-3xl w-fit" :ref="'message-' + msg.id">
                            <div :class="user.id === msg.sender.id ? 'flex-row-reverse' : 'flex-row'"
                                class="flex gap-2 items-center" title="Show profile"
                                @click="openMiniProfile(msg.sender)">
                                <UAvatar :src="useRuntimeConfig().public.imgUrl + msg.sender.id + '.webp'"
                                    :alt="msg.sender.name.toUpperCase()" size="md" class="cursor-pointer" />
                                <div class="flex flex-col">
                                    <span class="text-xs text-neutral-500 w-fit" title="" @click.stop>
                                        {{ toLocaleDate(msg.createdAt) }}
                                    </span>
                                    <span :class="user.id === msg.sender.id ? 'self-end' : ''"
                                        class="font-bold w-fit cursor-pointer">
                                        {{ msg.sender.name }}
                                    </span>
                                </div>
                            </div>
                            <div :class="user.id === msg.sender.id ? 'flex-row-reverse' : 'flex-row'"
                                class="flex gap-2 items-center group" @mouseover="msgHovered = index"
                                @mouseleave="msgHovered = null">
                                <div v-if="isReplyMsg(msg.content).originalMsg">
                                    <ReplyMessage :msg="msg" :user="user" :reply-msg="isReplyMsg(msg.content)"
                                        @goto="gotoMsg" />
                                </div>
                                <p v-else :class="user.id === msg.sender.id ? 'mr-10' : 'ml-10'"
                                    class="whitespace-pre-wrap hybrid-break">
                                    {{ msg.content }}
                                </p>
                                <UButton v-if="msgHovered === index" :padded="false" @click="setReplyTo(msg)" size="sm"
                                    class="w-6 h-6" color="neutral" icon="i-mdi-reply" title="Reply to this message"
                                    variant="link" />
                            </div>
                        </div>
                    </template>
                </div>
                <div v-else class="text-center text-neutral-500">
                    No messages yet.<br>
                    Be the first to send a message in this chat!
                </div>
            </div>
            <div v-if="newMessages > 0" @click="scrollToBottom"
                class="absolute bottom-24 left-1/2 -translate-x-1/2 bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-50 rounded-full px-2 py-1 text-xs cursor-pointer">
                <span>{{ newMessages > 10 ? '9+' : newMessages }}</span>
                new {{ newMessages === 1 ? 'message' : 'messages' }}
            </div>
            <div v-if="rateLimited" class="text-center text-red-500">
                You're sending messages too fast!<br>
                Please wait a moment before sending another message.
            </div>
            <div v-if="replyTo"
                class="flex flex-row content-center items-center gap-2 p-2 text-sm bg-neutral-100 dark:bg-neutral-950/90 rounded-xl">
                <p class="font-bold">Replying to {{ replyTo.sender.name }}:</p>
                <p>{{ removeReplyTag(replyTo.content) }}</p>
                <UButton @click="replyTo = null" color="neutral" size="xs" class="text-xs self-end" variant="link"
                    icon="i-heroicons-x-mark-16-solid" :padded="false" />
            </div>
            <UInput v-model="message" placeholder="Type a message..." @keyup.enter="sendMessage"
                :ui="{ icon: { trailing: { pointer: '' } } }" maxlength="256" class="w-full">
                <template #trailing>
                    <UButton color="neutral" variant="link" icon="i-mdi-send" :padded="false" @click="sendMessage" />
                </template>
            </UInput>
        </div>
        <div v-else class="flex flex-col items-center justify-center w-full h-full gap-2">
            <p>Cannot decrypt messages without a passphrase.</p>
            <p>Please enter the room again to view messages.</p>
            <NuxtLink to="/" class="mt-2 text-primary-500 underline hover:text-primary-700">Home</NuxtLink>
        </div>
        <div v-if="wsDisconnected"
            class="absolute top-0 left-0 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center">
            <div class="h-40 w-80 bg-neutral-100 dark:bg-neutral-950/90 flex flex-col items-center justify-center rounded-xl">
                <p>Connection has been lost.</p>
                <UButton @click="reconnect" color="neutral" variant="link" class="mt-4">Reconnect</UButton>
            </div>
        </div>
        <div v-else-if="selectedUser"
            class="absolute top-0 left-0 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center gap-2 p-4"
            @click="selectedUser = null">
            <Suspense>
                <MiniProfile :user="selectedUser" :room="$route.params.id" @close="selectedUser = null" @click.stop />
                <template #fallback>
                    <div
                        class="h-40 w-80 bg-neutral-100 dark:bg-neutral-950/90 flex flex-col items-center justify-center rounded-xl">
                        <UIcon name="i-mdi-loading" class="animate-spin text-4xl" />
                    </div>
                </template>
            </Suspense>
        </div>
        <div v-else-if="showRoomStats"
            class="absolute top-0 left-0 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center gap-2 p-4"
            @click="showRoomStats = false">
            <Suspense>
                <RoomStatsDialog :room="$route.params.id" :discover="discover" @close="showRoomStats = false"
                    @click.stop />
                <template #fallback>
                    <div
                        class="h-40 w-80 bg-neutral-100 dark:bg-neutral-950/90 flex flex-col items-center justify-center rounded-xl">
                        <UIcon name="i-mdi-loading" class="animate-spin text-4xl" />
                    </div>
                </template>
            </Suspense>
        </div>
    </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

class RateLimiter {
    constructor(refillRate, capacity) {
        this.tokens = capacity;
        this.lastRefill = Date.now();
        this.refillRate = refillRate;
        this.capacity = capacity;
    }

    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = (elapsed / 1000) * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    tryRemoveTokens(count) {
        this.refill();
        if (this.tokens >= count) {
            this.tokens -= count;
            return true;
        }
        return false;
    }

    isRateLimited() {
        this.refill();
        return this.tokens < 1;
    }
}

export default {
    data() {
        return {
            message: '',
            ws: null,
            gameId: '',
            wsDisconnected: false,
            selectedUser: null,
            newMessages: 0,
            rateLimiter: new RateLimiter(0.5, 4),
            rateLimited: false,
            showRoomStats: false,
            replyTo: null,
            msgHovered: null,
            passphrase: '',
            isLoadingMoreMessages: false,
            initialLoadComplete: false,
        }
    },
    async setup() {
        const route = useRoute();
        const sessionStore = useSessionStore();
        const user = computed(() => sessionStore.user);
        const passphraseCache = computed(() => sessionStore.passphraseCache);
        const messages = ref([]);
        const discover = ref({});
        const toast = useToast();
        const hasMoreMessages = ref(true);
        const isLoadingMessages = ref(false);
        const messageCursor = ref(null);
        const messageLimit = 25;

        definePageMeta({
            middleware: ['auth', 'unlocked'],
        });

        // fetch latest messages - no cursor
        const { data, error } = await useFetch(`/api/room/${route.params.id}`);

        if (error.value) {
            console.error('Failed to fetch room history:', error.value);
            const toast = useToast();
            toast.add({ title: 'Failed to fetch room history', description: error.value.message, color: 'red' });
        } else {
            if (data.value.code === 200) {
                const fetchedMessages = data.value.messages;

                const sortedMessages = [...fetchedMessages].sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                const decryptedMessages = await Promise.all(sortedMessages.map(async (msg) => {
                    const encryptedData = Uint8Array.from(atob(msg.content), c => c.charCodeAt(0));
                    const iv = Uint8Array.from(atob(msg.iv), c => c.charCodeAt(0));
                    const decryptedContent = await decryptMessage(encryptedData, iv, passphraseCache.value);
                    return {
                        ...msg,
                        content: decryptedContent
                    };
                }));
                messages.value = decryptedMessages;
                discover.value = data.value.discover;
            } else {
                throw showError({
                    statusCode: data.value.code,
                    statusMessage: data.value.message
                });
            }
        }

        async function hashKey(key) {
            const encoder = new TextEncoder();
            const data = encoder.encode(key);
            const hash = await crypto.subtle.digest('SHA-256', data);
            return new Uint8Array(hash);
        }

        async function encryptMessage(message, key) {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            const hashedKey = await hashKey(key);
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                hashedKey,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                data
            );
            return { iv, encryptedData };
        }

        async function decryptMessage(encryptedData, iv, key) {
            const hashedKey = await hashKey(key);
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                hashedKey,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                encryptedData
            );
            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);
        }

        useHead({
            title: route.params.id.slice(0, 8),
        });

        return { user, messages, toast, discover, passphraseCache, encryptMessage, decryptMessage, hasMoreMessages, isLoadingMessages, messageCursor, messageLimit };
    },
    mounted() {
        this.gameId = this.$route.params.id;
        try {
            this.connect();
        } catch (error) {
            console.error('Failed to connect to chat:', error);
            this.toast.add({ title: 'Error', description: error, color: 'red' });
        }
        if (this.$refs.messagesContainer) {
            this.scrollToBottom();
            // probably should replace this with a better way to detect initial load completion
            setTimeout(() => {
                this.initialLoadComplete = true;
            }, 1000);
        }
    },
    beforeUnmount() {
        if (this.ws) {
            this.ws.close();
        }
    },
    methods: {
        async connect() {
            if (!this.passphraseCache) return;
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
                    try {
                        const encryptedData = Uint8Array.from(atob(messageData.content), c => c.charCodeAt(0));
                        const iv = Uint8Array.from(atob(messageData.iv), c => c.charCodeAt(0));
                        const decryptedContent = await this.decryptMessage(encryptedData, iv, this.passphraseCache);
                        // Update chat history with decrypted content
                        if (!this.messages.some(m => m.id === messageData.id)) {
                            this.messages.push({
                                id: messageData.id,
                                sender: messageData.sender,
                                content: decryptedContent,
                                createdAt: messageData.createdAt,
                            });
                            if (this.$refs.messagesContainer.scrollTop + this.$refs.messagesContainer.clientHeight >= this.$refs.messagesContainer.scrollHeight) {
                                this.scrollToBottom();
                            } else this.showNewMessageToast();
                        }
                    } catch (error) {
                        console.error("Failed to decrypt message:", error);
                    }
                } else if (messageData.status === 'joined') {
                    console.log(`Joined room ${messageData.room_id}`);
                } else if (messageData.status === 'left') {
                    console.log(`Left room ${messageData.room_id}`);
                } else if (messageData.error) {
                    console.error("Server error:", messageData.error);
                    this.toast.add({ title: 'Error', description: messageData.error, color: 'red' });
                }
            });
        },
        async refetchMessages() {
            if (!this.passphraseCache) return;
            const { data, error } = await $fetch('/api/room/' + this.gameId);
            console.log(data, error);
            if (data.code === 200) {
                const fetchedMessages = data.messages;
                const decryptedMessages = await Promise.all(fetchedMessages.map(async (msg) => {
                    const encryptedData = Uint8Array.from(atob(msg.content), c => c.charCodeAt(0));
                    const iv = Uint8Array.from(atob(msg.iv), c => c.charCodeAt(0));
                    const decryptedContent = await decryptMessage(encryptedData, iv, this.passphraseCache);
                    return {
                        ...msg,
                        content: decryptedContent
                    };
                }));
                this.messages = decryptedMessages;
                this.discover = data.discover;
            } else {
                console.error('Failed to fetch room history:', error);
                this.toast.add({ title: 'Failed to fetch room history', description: error, color: 'red' });
            }
        },
        setReplyTo(msg) {
            this.replyTo = msg;
        },
        async sendMessage() {
            if (!this.passphraseCache) return;
            if (this.message.trim() === '') return;
            if (this.message.trim().length === 0 || this.message.trim().match(/^[\u200B\s]+$/)) {
                this.message = '';
                return;
            }
            let content = this.message;
            if (this.replyTo) {
                content = `<r:${this.replyTo.id}> ${content.trim()}`;
                this.replyTo = null;
            }
            if (this.message.length > 0) {
                if (!this.rateLimiter.tryRemoveTokens(1)) {
                    this.rateLimited = true;
                    console.error('Rate limit exceeded.');
                    this.toast.add({ title: 'Rate limit exceeded', description: 'You`re sending messages too fast!', color: 'red' });
                    return;
                }
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    const msgId = uuidv4();
                    const { iv, encryptedData } = await this.encryptMessage(content, this.passphraseCache);
                    const messageData = {
                        action: 'message',
                        room_id: this.gameId,
                        id: msgId,
                        content: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
                        iv: btoa(String.fromCharCode(...iv)),
                        sender: {
                            id: this.user.id,
                            name: this.user.name,
                        },
                        createdAt: new Date().toISOString()
                    };
                    this.ws.send(JSON.stringify(messageData));
                    this.rateLimited = false;
                    this.messages.push({
                        id: msgId,
                        sender: {
                            id: this.user.id,
                            name: this.user.name,
                        },
                        content: content,
                        createdAt: new Date().toISOString()
                    });
                    this.message = '';
                    this.scrollToBottom();
                } else {
                    console.error('WebSocket is not connected.');
                    this.wsDisconnected = true;
                }
            }
        },
        reconnect() {
            if (!this.passphraseCache) return;
            if (this.ws) {
                this.ws.close();
            }
            const isSecure = location.protocol === "https:";
            const url = (isSecure ? "wss://" : "ws://") + location.host + "/chatroom";
            this.ws = new WebSocket(url);
            this.wsDisconnected = false;
            this.refetchMessages();
        },
        openMiniProfile(user) {
            this.selectedUser = user;
        },
        scrollToBottom() {
            this.newMessages = 0;
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            });
        },
        showNewMessageToast() {
            const container = this.$refs.messagesContainer;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
                this.newMessages = 0;
            } else {
                this.newMessages++;
            }
        },
        handleScroll() {
            const container = this.$refs.messagesContainer;

            // Check if scrolled to bottom to reset new messages counter
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 20) {
                this.newMessages = 0;
            }

            // Only check for loading more if initial load is complete
            if (this.initialLoadComplete &&
                container.scrollTop < 50 &&
                this.hasMoreMessages &&
                !this.isLoadingMessages) {
                this.loadMoreMessages();
            }
        },
        async loadMoreMessages() {
            if (!this.passphraseCache || this.isLoadingMessages || !this.hasMoreMessages) return;

            this.isLoadingMessages = true;

            try {
                // Get the oldest message timestamp as cursor
                const oldestMessage = this.messages.length > 0 ?
                    this.messages[0] : null;

                if (!oldestMessage) {
                    this.hasMoreMessages = false;
                    return;
                }

                const context = oldestMessage.createdAt;
                const scrollHeightBefore = this.$refs.messagesContainer.scrollHeight;
                const scrollPosition = this.$refs.messagesContainer.scrollTop;

                // Fetch older messages
                const response = await $fetch(`/api/room/${this.gameId}?limit=${this.messageLimit}&context=${context}`);

                if (response.code === 200) {
                    if (!response.messages || response.messages.length === 0) {
                        this.hasMoreMessages = false;
                    } else {
                        const existingMessageIds = new Set(this.messages.map(m => m.id));
                        const uniqueMessages = response.messages.filter(msg => !existingMessageIds.has(msg.id));

                        if (uniqueMessages.length === 0) {
                            // If we got no new messages, we're at the end
                            this.hasMoreMessages = false;
                            return;
                        }

                        const sortedMessages = [...uniqueMessages].sort((a, b) =>
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        );

                        const decryptedMessages = await Promise.all(sortedMessages.map(async (msg) => {
                            const encryptedData = Uint8Array.from(atob(msg.content), c => c.charCodeAt(0));
                            const iv = Uint8Array.from(atob(msg.iv), c => c.charCodeAt(0));
                            const decryptedContent = await this.decryptMessage(encryptedData, iv, this.passphraseCache);
                            return {
                                ...msg,
                                content: decryptedContent
                            };
                        }));

                        this.messages.unshift(...decryptedMessages);
                        this.$nextTick(() => {
                            const newScrollHeight = this.$refs.messagesContainer.scrollHeight;
                            const heightDifference = newScrollHeight - scrollHeightBefore;
                            this.$refs.messagesContainer.scrollTop = scrollPosition + heightDifference;
                        });

                        this.hasMoreMessages = response.hasMore === true;
                    }
                } else {
                    this.toast.add({
                        title: 'Error loading messages',
                        description: response.message || 'Failed to load previous messages',
                        color: 'red'
                    });
                }
            } catch (error) {
                console.error('Failed to load more messages:', error);
                this.toast.add({
                    title: 'Error',
                    description: 'Failed to load previous messages',
                    color: 'red'
                });
                this.hasMoreMessages = false;
            } finally {
                this.isLoadingMessages = false;
            }
        },
        // async loadMessageContext(msgId) {
        //     if (!this.passphraseCache) return false;
        //     if (!msgId) return false;
        //     const response = await $fetch(`/api/room/${this.gameId}/messageContext?msg=${msgId}`);
        //     if (response.code === 200) {
        //         // Decrypt the context around the message and the message itself
        //         const decryptedMessagesBefore = await Promise.all(response.context.messagesBefore.map(async (msg) => {
        //             const encryptedData = Uint8Array.from(atob(msg.content), c => c.charCodeAt(0));
        //             const iv = Uint8Array.from(atob(msg.iv), c => c.charCodeAt(0));
        //             const decryptedContent = await this.decryptMessage(encryptedData, iv, this.passphraseCache);
        //             return {
        //                 ...msg,
        //                 content: decryptedContent
        //             };
        //         }));

        //         const decryptedMessagesAfter = await Promise.all(response.context.messagesAfter.map(async (msg) => {
        //             const encryptedData = Uint8Array.from(atob(msg.content), c => c.charCodeAt(0));
        //             const iv = Uint8Array.from(atob(msg.iv), c => c.charCodeAt(0));
        //             const decryptedContent = await this.decryptMessage(encryptedData, iv, this.passphraseCache);
        //             return {
        //                 ...msg,
        //                 content: decryptedContent
        //             };
        //         }));

        //         const encryptedData = Uint8Array.from(atob(response.context.message.content), c => c.charCodeAt(0));
        //         const iv = Uint8Array.from(atob(response.context.message.iv), c => c.charCodeAt(0));
        //         const decryptedMessage = await this.decryptMessage(encryptedData, iv, this.passphraseCache);

        //         const allNewMessages = [
        //             ...decryptedMessagesBefore,
        //             { ...response.context.message, content: decryptedMessage },
        //             ...decryptedMessagesAfter
        //         ];
        //         const existingMessagesMap = new Map(this.messages.map(m => [m.id, m]));
        //         const combinedMessages = [
        //             ...this.messages,
        //             ...allNewMessages.filter(msg => !existingMessagesMap.has(msg.id))
        //         ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        //         this.messages = combinedMessages;


        //         return true;
        //     } else {
        //         console.error('Failed to load message context:', response.message);
        //         return false;
        //     }
        // },
        toLocaleDate(date) {
            // today at, yesterday at, or date at time (hh:mm)
            const d = new Date(date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            if (d.toDateString() === today.toDateString()) {
                return 'Today at ' + d.toLocaleTimeString([], timeOptions);
            } else if (d.toDateString() === yesterday.toDateString()) {
                return 'Yesterday at ' + d.toLocaleTimeString([], timeOptions);
            } else {
                return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], timeOptions);
            }
        },
        shouldShowDateDivider(index) {
            if (index === 0) return true;
            const currentMessageDate = new Date(this.messages[index].createdAt).toDateString();
            const previousMessageDate = new Date(this.messages[index - 1].createdAt).toDateString();
            return currentMessageDate !== previousMessageDate;
        },
        formatDateDivider(date) {
            const d = new Date(date);
            return d.toLocaleDateString();
        },
        removeReplyTag(msg) {
            return msg.replace(/<r:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})>/g, '').trim();
        },
        isReplyMsg(msg) {
            const replyTagRegex = /<r:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})>/g;
            const match = replyTagRegex.exec(msg);
            if (match) {
                let originalMsg = this.messages.find(m => m.id === match[1]);
                if (!originalMsg) {
                    originalMsg = true;
                }
                return {
                    originalMsgId: match[1],
                    content: msg.replace(replyTagRegex, '').trim(),
                    originalMsg: originalMsg || null
                };
            }
            return { content: msg, originalMsgId: null, originalMsg: null };
        },
        async gotoMsg(msgId) {
            const index = this.messages.findIndex(m => m.id === msgId);
            if (index !== -1) {
                const messageElement = this.$refs['message-' + msgId][0];
                messageElement.scrollIntoView({ behavior: 'smooth' });
                if (this.$colorMode.value === 'dark') {
                    messageElement.classList.add('flash-dark');
                } else {
                    messageElement.classList.add('flash');
                }
                setTimeout(() => {
                    if (this.$colorMode.value === 'dark') {
                        messageElement.classList.remove('flash-dark');
                    } else {
                        messageElement.classList.remove('flash');
                    }
                }, 1000);
            } else {
                // try {
                //     const messagesLoaded = await this.loadMessageContext(msgId);
                //     if (messagesLoaded === true) {
                //         const messageElement = this.$refs['message-' + msgId][0];
                //         messageElement.scrollIntoView({ behavior: 'smooth' });
                //         if (this.$colorMode.value === 'dark') {
                //             messageElement.classList.add('flash-dark');
                //         } else {
                //             messageElement.classList.add('flash');
                //         }
                //         setTimeout(() => {
                //             if (this.$colorMode.value === 'dark') {
                //                 messageElement.classList.remove('flash-dark');
                //             } else {
                //                 messageElement.classList.remove('flash');
                //             }
                //         }, 1000);
                //     } else {
                //         throw new Error('Failed to load message context.');
                //     }
                // } catch (error) {
                //     console.error('Failed "goto" operation:', error);
                // }
                this.toast.add({ title: 'Message not found', description: 'The message you are trying to find could not be located.', color: 'red' });
            }
        },
    },
}
</script>


<style scoped>
.hybrid-break {
    overflow-wrap: break-word;
    word-break: break-word;
}

.flash {
    animation: flash-animation 1s ease-in-out;
}

.flash-dark {
    animation: flash-dark-animation 1s ease-in-out;
}

@keyframes flash-animation {

    0%,
    100% {
        background-color: transparent;
    }

    50% {
        background-color: var(--color-neutral-200);
    }
}

@keyframes flash-dark-animation {

    0%,
    100% {
        background-color: transparent;
    }

    50% {
        background-color: var(--color-neutral-200);
    }
}

.scrollbar {
    scrollbar-width: thin;
    scrollbar-color: var(--color-neutral-300) var(--color-neutral-900);
}

.scrollbar::-webkit-scrollbar {
    width: 3px;
    background-color: var(--color-neutral-900);
}
</style>