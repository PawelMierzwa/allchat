<template>
    <UContainer
        class="flex flex-col relative bg-neutral-100 dark:bg-neutral-950/90 rounded-xl items-center justify-between w-80 px-12 py-8">
        <UButton class="absolute top-2 right-2" @click="$emit('close')" variant="link" icon="i-heroicons-x-mark" />
        <h2 class="text-2xl">{{ $t('index.loginTo') }}</h2>
        <div class="flex flex-col my-4 space-y-4">
            <UInput v-model="username" :placeholder="$t('generic.username')" @input="errorMsg = ''" />
            <UInput v-model="password" :placeholder="$t('generic.password')" type="password" @keyup.enter="sendLogin"
                @input="errorMsg = ''" />
            <UCheckbox :label="$t('generic.rememberMe')" v-model="remember">
                <template #label="{ label }">
                    <span class="text-sm text-neutral-500 select-none">{{ label }}</span>
                </template>
            </UCheckbox>
        </div>
        <UButton @click="sendLogin" :loading="loadingRequest" loading-icon="i-mdi-loading" :data-error="errorMsg"
            class="data-[error='']:my-1">{{ $t('generic.login') }}</UButton>
        <p class="text-red-600 text-center my-2">{{ errorMsg }}</p>
        <UButton class="text-primary-500 hover:text-primary-700 hover:underline transition-none absolute bottom-2"
            @click="$emit('noAcc')" variant="link">{{ $t('generic.noAccount') }}</UButton>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: '',
            loadingRequest: false,
            errorMsg: '',
            remember: false
        }
    },
    methods: {
        async sendLogin() {
            if (!this.username || !this.password) {
                this.errorMsg = this.$t('index.fillInFields');
                return;
            }
            this.loadingRequest = true;
            try {
                const response = await $fetch('/api/account/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                        remember: this.remember
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