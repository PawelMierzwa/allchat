<template>
    <UContainer class="flex flex-col bg-gray-900 rounded-xl items-center justify-between h-80 w-80 px-12 py-4">
        <slot />
        <h2 class="text-2xl">Login to AllChat</h2>
        <div class="flex flex-col space-y-4">
            <UInput v-model="username" placeholder="Username" @input="errorMsg = ''" />
            <UInput v-model="password" placeholder="Password" type="password" @keyup.enter="sendLogin" @input="errorMsg = ''" />
        </div>
        <UButton @click="sendLogin" :loading="loadingRequest" loading-icon="i-mdi-loading" :data-error="errorMsg" class="data-[error='']:mb-4 mb-0">Login</UButton>
        <p class="text-red-600">{{ errorMsg }}</p>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: '',
            loadingRequest: false,
            errorMsg: ''
        }
    },
    methods: {
        async sendLogin() {
            this.loadingRequest = true;
            try {
                const response = await $fetch('/api/account/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });
                if (response.status === 200) {
                    this.errorMsg = "";
                    this.$emit('login', response.message);
                } else {
                    setTimeout(() => {
                        this.loadingRequest = false;
                        this.errorMsg = response.message;
                    }, 1000);
                }
            } catch (err) {
                this.loadingRequest = false;
                this.errorMsg = err;
                console.error(err);
            } finally {
                setTimeout(() => {
                    this.loadingRequest = false;
                }, 1500);
            }
        },
    }
}
</script>