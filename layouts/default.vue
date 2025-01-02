<template>
    <div>
        <nav class="flex flex-row justify-between items-center px-4 bg-gray-900 text-white">
            <UHorizontalNavigation :links="links" class="border-b border-gray-200 p-2 dark:border-gray-800" />
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
    computed: {
        currentYear() {
            return new Date().getFullYear();
        }
    }
}
</script>