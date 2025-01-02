`<template>
    <UContainer class="pt-8 font-mono">
        <h1 class="text-7xl font-bold w-fit mt-32 mx-auto">AllChat</h1>
        <div v-if="!loadRoom" class="mt-8">
            <h2 class="text-2xl font-bold w-fit mx-auto">enter passphrase:</h2>
            <UInput size="xl" v-model.trim="passphrase" @keydown="inputKeydown($event)" placeholder="Secret_room_2137"
                class="w-72 mx-auto mt-4 caret-primary" @keyup.enter="enterRoom" maxlength="32"
                :ui="{ icon: { trailing: { pointer: '' } } }">
                <template #trailing>
                    <UButton v-show="showEnterButton" color="gray" variant="link" icon="i-mdi-arrow-right-circle"
                        :padded="false" @click="enterRoom" />
                </template>
            </UInput>
        </div>
        <div class="mx-auto mt-8 flex flex-col items-center justify-center" v-else>
            <h2 class="text-3xl">Loading room...</h2>
            <UIcon name="i-mdi-loading" class="animate-spin text-4xl mx-auto mt-8" />
        </div>
    </UContainer>
</template>

<script>
export default {
    data() {
        return {
            passphrase: '',
            loadRoom: false
        }
    },
    watch: {
        passphrase(val) {
            this.passphrase = val.replace(/[^a-zA-Z0-9_]/g, '');
        }
    },
    computed: {
        showEnterButton() {
            return this.passphrase.length > 3;
        }
    },
    methods: {
        inputKeydown(e) {
            if (/[^\w\s]/.test(e.key)) {
                e.preventDefault();
            }
        },
        enterRoom() {
            // passsphrase cant start with _ or space, cant have multiple _ or space in a row
            if (this.passphrase.startsWith('_') || this.passphrase.startsWith(' ') || this.passphrase.includes('__') || this.passphrase.includes('  ')) {
                this.passphrase = this.passphrase.replace(/_+/g, '_').replace(/ +/g, ' ').trim();
                return;
            }
            if (this.passphrase.length > 3 && this.passphrase.length < 32) {
                this.loadRoom = true;
                $fetch('/api/hash', {
                    method: 'POST',
                    body: JSON.stringify({ passphrase: this.passphrase })
                }).then(data => {
                    setTimeout(() => {
                        this.$router.push(`/room/${data}`);
                    }, 1500);
                }).catch(err => {
                    console.error(err);
                    this.loadRoom = false;
                });
            }
        }
    }
}
</script>`