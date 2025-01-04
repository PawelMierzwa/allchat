`<template>
    <UContainer class="pt-8 font-mono">
        <h1 class="text-7xl font-bold w-fit mt-32 mx-auto">AllChat</h1>
        <div v-if="!loadRoom" class="mt-8 flex flex-col items-center justify-center">
            <h2 class="text-2xl font-bold w-fit mx-auto">enter passphrase:</h2>
            <UInput size="xl" v-model.trim="passphrase" @keydown="inputKeydown($event)" placeholder="Secret_room_2137"
                class="w-72 mx-auto mt-4 caret-primary" @keyup.enter="enterRoom" maxlength="32"
                :ui="{ icon: { trailing: { pointer: '' } } }">
                <template #trailing>
                    <UButton v-show="showEnterButton" color="gray" variant="link" icon="i-mdi-arrow-right-circle"
                        :padded="false" @click="enterRoom" />
                </template>
            </UInput>
            <a class="text-primary-500 hover:text-primary-800 mt-4 text-sm w-fit cursor-pointer"
                @click="showLogin = true" v-if="!isAuthenticated">
                Login to join a room
            </a>
        </div>
        <div class="mx-auto mt-8 flex flex-col items-center justify-center" v-else>
            <h2 class="text-3xl">Loading room...</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
            <UButton color="gray" variant="link" @click="loadRoom = false" class="mt-10">Cancel</UButton>
        </div>
        <div v-if="showLogin"
            class="absolute top-0 left-0 w-full h-full bg-gray-900/70 flex flex-col items-center justify-center">
            <LoginDialog @login="handleLogin">
                <UButton variant="link" icon="i-heroicons-x-mark" @click="showLogin = false" class="self-end" />
            </LoginDialog>
            <a class="text-primary-500 hover:text-primary-800 mt-6 cursor-pointer"
                @click="showLogin = false; showRegister = true">Don't have an account?</a>
        </div>
        <div v-else-if="showRegister"
            class="absolute top-0 left-0 w-full h-full bg-gray-900/70 flex flex-col items-center justify-center">
            <RegisterDialog @register="handleRegister">
                <UButton variant="link" icon="i-heroicons-x-mark" @click="showRegister = false" class="self-end"
                    :padded="false" />
            </RegisterDialog>
            <a class="text-primary-500 hover:text-primary-800 mt-6 cursor-pointer"
                @click="showRegister = false; showLogin = true">Already have an account?</a>
        </div>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            passphrase: '',
            loadRoom: false,
            showLogin: false,
            showRegister: false,
            passphraseCache: '',
            enterTimeout: null
        }
    },
    setup() {
        const sessionStore = useSessionStore();
        const isAuthenticated = computed(() => sessionStore.isAuthenticated);
        const user = computed(() => sessionStore.user);
        const startSession = function (id, name, email) {
            sessionStore.login({ id, name, email });
        }
        const toast = useToast();

        definePageMeta({
            middleware: 'auth',
        })

        return { isAuthenticated, startSession, user, toast };
    },
    watch: {
        passphrase(val) {
            this.passphrase = val.replace(/[^a-zA-Z0-9_]/g, '');
        }
    },
    computed: {
        showEnterButton() {
            return this.passphrase.length >= 3;
        }
    },
    methods: {
        inputKeydown(e) {
            if (/[^\w\s]/.test(e.key)) {
                e.preventDefault();
            }
        },
        enterRoom() {
            if (!this.isAuthenticated) {
                this.passphraseCache = this.passphrase;
                this.showLogin = true;
                return;
            }
            // passsphrase cant start with _ or space, cant have multiple _ or space in a row
            if (this.passphrase.startsWith('_') || this.passphrase.startsWith(' ') || this.passphrase.includes('__') || this.passphrase.includes('  ')) {
                this.passphrase = this.passphrase.replace(/_+/g, '_').replace(/ +/g, ' ').trim();
                return;
            }
            if (this.passphrase.length >= 3 && this.passphrase.length < 32) {
                this.loadRoom = true;
                $fetch('/api/hash', {
                    method: 'POST',
                    body: JSON.stringify({ id: this.user.id, passphrase: this.passphrase })
                }).then(data => {
                    if (data.code === 200) {
                        this.enterTimeout = setTimeout(() => {
                            this.$router.push(`/room/${data.message}`);
                        }, 1500);
                    } else {
                        this.loadRoom = false;
                        this.toast.add({ description: data.message, color: 'red' });
                    }
                }).catch(err => {
                    console.error(err);
                    this.loadRoom = false;
                });
            }
        },
        cancelEnter() {
            this.loadRoom = false;
            clearTimeout(this.enterTimeout);
        },
        handleRegister() {
            this.showRegister = false;
            this.showLogin = true;
            this.toast.add({ description: 'Account created. You can now login.' });
        },
        handleLogin(user) {
            this.showLogin = false;
            this.startSession(user.id, user.name, user.email);
            this.toast.add({ description: 'Logged in successfully.'});
            if (this.passphraseCache) {
                this.passphrase = this.passphraseCache;
                this.enterRoom();
            }
        }
    }
}
</script>`