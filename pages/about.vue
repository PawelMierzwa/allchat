<template>
    <UContainer class="font-mono md:p-32 pt-32 flex flex-col items-center">
        <h1 class="text-5xl w-fit mx-auto">About AllChat</h1>
        <div class="flex flex-col items-center justify-between mx-auto mt-10 w-1/2 gap-4">
            <p>
                AllChat allows you to have both private and public conversations, 
                as long as your passphrase is secure.
            </p>
            <p>
                I created AllChat to provide a secure and private chat experience for everyone. 
                Messages are encrypted, and only you and people with the passphrase can read them.
            </p>
        </div>
        <div class="flex flex-col items-center justify-between mt-10 md:w-1/2 gap-4">
            <p>This website is source-available, with it's <NuxtLink to="https://github.com/pawelmierzwa/allchat" class="underline hover:text-gray-400">code available on GitHub.</NuxtLink></p>
        </div>
    </UContainer>
</template>