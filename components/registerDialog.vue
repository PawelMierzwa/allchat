<template>
    <UContainer class="flex flex-col bg-gray-900 rounded-xl items-center justify-between h-80 w-80 px-12 py-4">
        <slot />
        <h2 class="text-2xl mb-2">Create your<br>AllChat account</h2>
        <div class="flex flex-col space-y-4">
            <UInput v-model="username" placeholder="Username" @input="errorMsg = ''" />
            <UInput v-model="email" placeholder="Email" @input="errorMsg = ''" />
            <UInput v-model="password" placeholder="Password" type="password" @keyup.enter="sendRegister" @input="errorMsg = ''" />
        </div>
        <UButton @click="sendRegister" :loading="loadingRequest" loading-icon="i-mdi-loading" class="mt-4 mb-2">Register</UButton>
        <p class="text-red-600">{{ errorMsg }}</p>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            email: '',
            password: '',
            loadingRequest: false,
            errorMsg: ''
        }
    },
    methods: {
        async sendRegister() {
            this.loadingRequest = true;
            try {
                const response = await $fetch('/api/account/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.username,
                        email: this.email,
                        password: this.password
                    })
                });
                if (response.status === 200) {
                    this.errorMsg = "";
                    this.$emit('register', response.message);
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