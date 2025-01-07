<template>
    <div :class="user.id === msg.sender.id ? 'mr-10' : 'ml-10'"
        class="whitespace-pre-wrap hybrid-break cursor-pointer" title="Go to original message" @click="$emit('goto', replyMsg.originalMsg.id)">
        <p :class="user.id === msg.sender.id ? 'text-end' : 'text-start'" class="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">replying to {{ replyMsg.originalMsg.sender.name }}: {{
                replyMsg.originalMsg.content }}
        </p>
        <p>{{ replyMsg.content }}</p>
    </div>
</template>

<script setup>
defineProps({
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
</script>