<template>
    <UContainer
        class="flex flex-col relative bg-neutral-100 dark:bg-neutral-950/90 rounded-xl items-center justify-between w-80 px-12 py-8">
        <UButton class="absolute top-2 right-2" @click="$emit('close')" variant="link" icon="i-heroicons-x-mark" />
        <h2 class="text-2xl mb-4">{{ $t('index.createYour') }}<br>{{ $t('generic.allchatAccount') }}</h2>
        <div class="flex flex-col space-y-4">
            <UInput v-model="username" :placeholder="$t('generic.username')" @input="errorMsg = ''" />
            <UInput v-model="email" :placeholder="$t('generic.email')" @input="errorMsg = ''" />
            <UInput v-model="password" :placeholder="$t('generic.password')" type="password" @keyup.enter="sendRegister"
                @input="errorMsg = ''" />
        </div>
        <UButton @click="sendRegister" :loading="loadingRequest" loading-icon="i-mdi-loading" :data-error="errorMsg"
            class="data-[error='']:my-4">{{ $t('generic.register') }}
        </UButton>
        <p class="text-red-600 text-center my-2">{{ errorMsg }}</p>
        <UButton class="text-primary-500 hover:text-primary-700 absolute bottom-2 hover:underline transition-none"
            @click="$emit('hasAcc')" variant="link">{{ $t('generic.hasAccount') }}</UButton>
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