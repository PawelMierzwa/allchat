`<template>
    <UContainer class="my-auto pb-8 font-mono">
        <div class="mx-auto flex flex-col items-center justify-center w-fit">
            <h1 class="text-7xl font-bold w-fit">AllChat</h1>
            <UButton
                class="dark:text-neutral-500 text-xs pt-0 hover:underline transition-none self-end w-fit"
                @click="showRules = true" color="neutral" variant="link">
                {{ $t('index.whatsthis') }}
            </UButton>
        </div>
        <div v-if="!loadRoom"
            class="mt-6 flex flex-col items-center justify-center bg-neutral-100 dark:bg-zinc-900 p-8 rounded-xl ring-1 ring-primary-500 w-fit mx-auto">
            <h2 class="text-2xl w-fit mx-auto">{{ $t('index.passphrase') }}</h2>
            <UInput size="lg" v-model.trim="passphrase" @keydown="inputKeydown($event)"
                :placeholder="$t('index.placeholder')" class="w-72 mx-auto mt-4 caret-primary" @keyup.enter="enterRoom"
                maxlength="32" :ui="{ icon: { trailing: { pointer: '' } } }">
                <template #trailing>
                    <UButton v-if="passphrase?.length >= 3" aria-label="Enter a room" size="sm"
                        color="neutral" variant="link" icon="i-mdi-arrow-right-circle" :padded="false"
                        @click="enterRoom" />
                </template>
            </UInput>
            <UButton
                class="text-primary-500 hover:text-primary-700 mt-4 text-sm w-fit hover:underline transition-none"
                @click="enterRoom" v-if="passphrase?.length >= 3 && isAuthenticated" variant="link">
                {{ $t('index.enter') }}
            </UButton>
            <UButton
                class="text-primary-500 hover:text-primary-700 mt-4 text-sm w-fit hover:underline transition-none"
                @click="showLogin = true" v-if="!isAuthenticated" variant="link">
                {{ $t('index.login') }}
            </UButton>
        </div>
        <div class="mx-auto mt-8 flex flex-col items-center justify-center" v-else>
            <h2 class="text-3xl">{{ $t('index.loading') }}</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
            <UButton color="neutral" variant="link" @click="loadRoom = false"
                class="mt-10 cursor-pointer hover:underline transition-none">{{ $t('generic.cancel') }}</UButton>
        </div>
        <div v-if="showLogin"
            class="absolute top-0 left-0 z-50 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center">
            <LoginDialog @login="handleLogin" @noAcc="showLogin = false; showRegister = true"
                @close="showLogin = false" />
        </div>
        <div v-else-if="showRegister"
            class="absolute top-0 left-0 z-50 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center">
            <RegisterDialog @register="handleRegister" @hasAcc="showRegister = false; showLogin = true"
                @close="showRegister = false" />
        </div>
        <div v-else-if="showRules"
            class="absolute top-0 left-0 z-50 w-full h-full bg-neutral-900/70 flex flex-col items-center justify-center">
            <RulesDialog @close="showRules = false" />
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
            enterTimeout: null,
            showRules: false,
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
        });

        useSeoMeta({
            ogImage: '/small-bg.png',
            description: 'Connect with the world using passphrases.',
            ogTitle: 'AllChat',
            ogDescription: 'Connect with the world using passphrases.',
            icon: '/favicon.ico',
            lang: 'en',
            ogUrl: 'https://allchat.cc/',
            twitterTitle: 'AllChat',
            twitterDescription: 'Connect with the world using passphrases.',
            twitterImage: '/small-bg.png',
            twitterCard: 'summary',
        })

        return { isAuthenticated, startSession, user, toast, setPassphrase: sessionStore.setPassphraseCache };
    },
    watch: {
        passphrase(val) {
            this.passphrase = val.replace(/[^a-zA-Z0-9_]/g, '');
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
            if (this.passphrase.length >= 3 && this.passphrase.length <= 32) {
                this.loadRoom = true;
                // hash the passphrase and send it to the server
                crypto.subtle.digest('SHA-1', new TextEncoder().encode(this.passphrase)).then(hashBuffer => {
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

                    $fetch('/api/hash', {
                        method: 'POST',
                        body: JSON.stringify({ id: this.user.id, passphrase: hash })
                    }).then(data => {
                        if (data.code === 200) {
                            crypto.subtle.digest('SHA-256', new TextEncoder().encode(this.passphrase + this.passphrase)).then(hashBuffer => {
                                const hashArray = Array.from(new Uint8Array(hashBuffer));
                                const hashedPassphrase = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
                                this.setPassphrase(hashedPassphrase);
                                this.enterTimeout = setTimeout(() => {
                                    this.$router.push(`/room/${hash}`);
                                }, 1500);
                            });
                        } else {
                            this.loadRoom = false;
                            this.toast.add({ description: data.message, color: 'red' });
                        }
                    }).catch(err => {
                        console.error(err);
                        this.loadRoom = false;
                    });
                });
            }
        },
        cancelEnter() {
            this.loadRoom = false;
            clearTimeout(this.enterTimeout);
        },
        handleRegister(userData) {
            this.showRegister = false;
            this.startSession(userData.id, userData.name, userData.email);
            this.toast.add({ description: 'Registered successfully.' });
            if (this.passphraseCache) {
                this.passphrase = this.passphraseCache;
                this.enterRoom();
            }
        },
        handleLogin(userData) {
            this.showLogin = false;
            this.startSession(userData.id, userData.name, userData.email);
            this.toast.add({ description: 'Logged in successfully.' });
            if (this.passphraseCache) {
                this.passphrase = this.passphraseCache;
                this.enterRoom();
            }
        }
    }
}
</script>`