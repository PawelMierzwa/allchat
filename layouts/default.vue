<template>
    <div>
        <nav class="flex flex-row justify-between items-center px-4 bg-gray-900 text-white">
            <UHorizontalNavigation :links="links" class="border-b border-gray-200 p-2 dark:border-gray-800">
                <template #default="{ link, isActive }">
                    <span :data-active="isActive" class="data-[active=true]:text-primary-50 data-[active=true]:group-hover:text-black data-[active=true]:group-hover:dark:text-white relative">{{ link.label }}</span>
                </template>
            </UHorizontalNavigation>
        </nav>
        <UContainer>
            <slot />
        </UContainer>
        <footer class="bg-gray-900 text-gray-400 text-center p-4 bottom-0 absolute w-full">
            <p class="text-xs">&copy; {{ currentYear }} AllChat</p>
        </footer>
    </div>
</template>

<script>
export default {
    data() {
        return {
            links: [
                [{ label: 'AllChat', to: '/' }],
                [
                    { label: 'Profile', avatar: { src: 'https://i.pravatar.cc/32' }, badge: 'test' },
                    { label: 'Settings', to: '/settings', icon: 'i-heroicons-cog' },
                    { label: 'About', to: '/about', icon: 'i-heroicons-information-circle' },
                ]]
        }
    },
    setup() {
        useHead({
            titleTemplate (titleChunk) {
                return titleChunk ? `AllChat | ${titleChunk}` : 'AllChat';
            },
            meta: [
                { name: 'description', content: 'Chat with everyone through passphrases.' },
                { name: 'keywords', content: 'chat, passphrase, room, allchat, social media, social' },
                { name: 'author', content: 'BadInfluence' }
            ]
        });
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        }
    }
}
</script>