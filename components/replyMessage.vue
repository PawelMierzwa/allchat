<template>
    <div :class="user.id === msg.sender.id ? 'mr-10' : 'ml-10'" class="whitespace-pre-wrap hybrid-break cursor-pointer"
        :title="$t('room.goToMsg')" @click="$emit('goto', replyMsg.originalMsgId)">
        <p v-if="replyMsg.originalMsg && replyMsg.originalMsg != true"
            :class="user.id === msg.sender.id ? 'text-end' : 'text-start'"
            class="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
            {{ $t('room.replyingTo').toLocaleLowerCase() }} {{ replyMsg.originalMsg.sender.name }}: {{
                removeReplyTag(replyMsg.originalMsg.content) }}
        </p>
        <p v-else-if="replyMsg.originalMsg === true && fetchedOriginalMsg"
            :class="user.id === msg.sender.id ? 'text-end' : 'text-start'"
            class="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
            {{ $t('room.replyingTo').toLocaleLowerCase() }} {{ fetchedOriginalMsg.sender.name }}: {{
                removeReplyTag(fetchedOriginalMsg.content) }}
        </p>
        <p v-else :class="user.id === msg.sender.id ? 'text-end' : 'text-start'"
            class="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
            {{ $t('room.replyingToDeleted') }}
        </p>
        <p>{{ replyMsg.content }}</p>
    </div>
</template>

<script setup>
const route = useRoute();

const props = defineProps({
    msg: {
        type: Object,
        required: true,
    },
    replyMsg: {
        type: Object,
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
});

function removeReplyTag(msg) {
    return msg.replace(/<r:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})>/g, '').trim();
};

async function fetchOriginalMsg() {
    if (props.replyMsg.originalMsg === true) {
        try {
            const response = await $fetch(`/api/room/${route.params.id}/findMessage?msg=${props.replyMsg.originalMsgId}`);
            if (response && response.searchedMsg) {
                fetchedOriginalMsg.value = response.searchedMsg;

                const sessionStore = useSessionStore();
                const passphraseCache = computed(() => sessionStore.passphraseCache);
                const encryptedData = Uint8Array.from(atob(fetchedOriginalMsg.value.content), c => c.charCodeAt(0));
                const iv = Uint8Array.from(atob(fetchedOriginalMsg.value.iv), c => c.charCodeAt(0));
                const decryptedContent = await decryptMessage(encryptedData, iv, passphraseCache.value);
                fetchedOriginalMsg.value.content = decryptedContent;
            }
        } catch (error) {
            console.error('Failed to fetch original message:', error);
        }
    }
}

async function hashKey(key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
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

const fetchedOriginalMsg = ref(null);

onMounted(() => {
    if (props.replyMsg.originalMsg === true) {
        fetchOriginalMsg();
    }
})
</script>