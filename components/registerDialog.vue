<template>
    <UContainer
        class="flex flex-col relative bg-gray-100 dark:bg-gray-950/90 rounded-xl items-center justify-between w-80 px-12 py-8">
        <UButton class="absolute top-2 right-2" @click="$emit('close')" variant="link" icon="i-heroicons-x-mark" />
        <h2 class="text-2xl mb-4">Create your<br>AllChat account</h2>
        <div class="flex flex-col space-y-4">
            <UInput v-model="username" placeholder="Username" @input="errorMsg = ''" />
            <UInput v-model="email" placeholder="Email" @input="errorMsg = ''" />
            <UInput v-model="password" placeholder="Password" type="password" @keyup.enter="sendRegister"
                @input="errorMsg = ''" />
        </div>
        <UButton @click="sendRegister" :loading="loadingRequest" loading-icon="i-mdi-loading" :data-error="errorMsg"
            class="data-[error='']:my-4">Register
        </UButton>
        <p class="text-red-600 text-center my-2">{{ errorMsg }}</p>
        <UButton class="text-primary-500 hover:text-primary-800 absolute bottom-2 cursor-pointer"
            @click="$emit('hasAcc')" variant="link">Already have an account?</UButton>
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