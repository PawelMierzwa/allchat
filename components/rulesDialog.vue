<template>
    <div class="px-12 py-8 bg-gray-100 dark:bg-gray-950/90 rounded-xl flex flex-col items-center gap-4 justify-between">
        <h2 class="text-2xl text-primary-500">How does this work?</h2>
        <ul class="list-disc list-inside">
            <li>Enter a passphrase to enter a room.</li>
            <li>Share the passphrase with your friends to chat privately.</li>
            <li>Be careful with the passphrase, as anyone with it can join the room.</li>
            <li>Passphrases can be used as a topic for the rooms.</li>
            <li>Passphrases are case-sensitive, and must be between 3 and 32 characters.</li>
            <li>If you forget the passphrase, you can't recover it.</li>
            <li>Have fun!</li>
        </ul>
        <UButton @click="$emit('close')" variant="link" class="self-end">Close</UButton>
    </div>
</template>