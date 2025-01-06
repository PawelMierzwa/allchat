<template>
    <UContainer
        class="flex flex-col relative bg-gray-100 dark:bg-gray-950/90 rounded-xl items-center justify-between w-80 px-12 py-8">
        <UButton class="absolute top-2 right-2" @click="$emit('close')" variant="link" icon="i-heroicons-x-mark" />
        <h2 class="text-2xl">Login to AllChat</h2>
        <div class="flex flex-col my-4 space-y-4">
            <UInput v-model="username" placeholder="Username" @input="errorMsg = ''" />
            <UInput v-model="password" placeholder="Password" type="password" @keyup.enter="sendLogin"
                @input="errorMsg = ''" />
        </div>
        <UButton @click="sendLogin" :loading="loadingRequest" loading-icon="i-mdi-loading" :data-error="errorMsg"
            class="data-[error='']:my-4">Login</UButton>
        <p class="text-red-600 text-center my-2">{{ errorMsg }}</p>
        <UButton class="text-primary-500 hover:text-primary-800 cursor-pointer absolute bottom-2"
            @click="$emit('noAcc')" variant="link">Don't have an account?</UButton>
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