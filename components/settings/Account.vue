<template>
    <div
        class="flex flex-col justify-between gap-4 py-4 px-5 scroll bg-neutral-100 h-[50vh] overflow-y-auto dark:bg-neutral-900 rounded-md">
        <h2 class="text-lg">{{ $t('settings.profile') }}</h2>
        <div class="flex flex-row items-center gap-4">
            <UAvatar :src="useRuntimeConfig().public.imgUrl + user.id + '.webp'" :alt="user.name.toUpperCase()"
                size="lg" />
            <div>
                <h2>{{ user.name }}</h2>
                <p>{{ user.email }}</p>
            </div>
        </div>
        <form class="flex flex-col justify-between gap-4 w-full">
            <div class="row" style="gap: 5px; align-items: center;">
                <div class="flex flex-row items-center gap-1">
                    <UModal v-model:open="openFilePicker" title="Upload Profile Picture">
                        <UButton color="primary" variant="soft" rounded="xl" @click="fileSize = '0 MB'">
                            {{ $t('settings.updatePicture') }}
                        </UButton>
                        <template #content>
                            <UCard id="upload-card" class="border dark:border-neutral-700">
                                <div ref="imagePreviews" id="imagePreviews"
                                    :class="scaledPicture != null ? 'mb-2' : ''">
                                </div>
                                <UInput type="file" @change="handleFileUpload" size="lg" accept="image/png, image/jpeg"
                                    icon="mdi-arrow-expand-up" label="Upload photo" id="file-upload" required>
                                    <template #trailing>
                                        <span class="text-neutral-500 dark:text-neutral-400 text-xs">
                                            {{ fileSize }}
                                        </span>
                                    </template>
                                </UInput>
                                <template #footer>
                                    <div class="flex flex-row items-center justify-between gap-4">
                                        <UButton :disabled="!scaledPicture" color="primary"
                                            class="disabled:cursor-not-allowed"
                                            @click="uploadProfilePicture(); openFilePicker = false">Upload</UButton>
                                        <UButton variant="subtle" color="error" @click="openFilePicker = false">{{
                                            $t('generic.close') }}</UButton>
                                    </div>
                                </template>
                            </UCard>
                        </template>
                    </UModal>
                    <UButton variant="soft" color="error" title="Delete profile picture" @click="deleteProfilePicture">
                        <UIcon size="xl" class="text-xl" name="i-mdi-trash-can-outline" />
                    </UButton>
                </div>
            </div>
        </form>
        <USeparator class="mt-2" />
        <h2 class="text-lg">{{ $t('settings.security') }}</h2>
        <div class="flex flex-col gap-1">
            <p>{{ $t('settings.twoFA') }}</p>
            <UButton variant="soft" color="success" class="w-fit" :disabled="true" v-if="!has2FA">{{
                $t('settings.enable2FA') }}
            </UButton>
            <UButton variant="soft" color="error" class="w-fit" :disabled="true" v-else>{{ $t('settings.disable2FA') }}
            </UButton>
        </div>
        <div class="flex flex-col gap-2 mt-4">
            <p>{{ $t('settings.changePassword') }}</p>
            <UInput @keyup.enter="focusNewPassword" type="password" autocomplete="current-password"
                :placeholder="$t('settings.currentPassword')" v-model="currentPassword" />
            <UInput @keyup.enter="changePassword" type="password" autocomplete="new-password"
                :placeholder="$t('settings.newPassword')" id="newPasswordInput" v-model="newPassword" />
            <UButton @click="changePassword" color="primary" :loading="loadingChangePassword"
                loading-icon="i-mdi-loading" class="w-fit self-end" variant="link">{{ $t('settings.change') }}</UButton>
        </div>
        <USeparator class="mt-2" />
        <h2 class="text-lg">{{ $t('settings.other') }}</h2>
        <div class="flex flex-row gap-2">
            <UButton variant="outline" class="w-fit" @click="logout">{{ $t('generic.logout') }}</UButton>
            <UButton color="error" variant="soft" class="w-fit">{{ $t('settings.deleteAccount') }}</UButton>
        </div>
    </div>
</template>

<script setup>
const sessionStore = useSessionStore();
const user = computed(() => sessionStore.user);
const open = ref(false);
const loading = ref(false);
const scaledPicture = ref(null);
const picture = ref(null);
const fileSize = ref("0 MB");
const toast = useToast();
const has2FA = ref(false);
const openFilePicker = ref(false);
const newPassword = ref('');
const currentPassword = ref('');
const loadingChangePassword = ref(false);
const { t } = useI18n();

const logout = function () {
    sessionStore.logout();
    open.value = false;
    const router = useRouter();
    router.push('/');
}

onMounted(() => {
    $fetch('/api/account/2fa').then((res) => {
        has2FA.value = res.status === 200;
    });
});

function focusNewPassword() {
    document.getElementById('newPasswordInput').focus();
}

async function uploadProfilePicture() {
    if (scaledPicture.value === null) {
        return;
    }

    if (loading.value) {
        return;
    }

    if (picture.value === null) {
        return;
    }

    if (picture.value.size > 2000000) {
        toast.add({ title: t('generic.error'), description: t('settings.fileSizeError'), color: 'error' });
        return;
    }

    loading.value = true;
    scaledPicture.value.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('avatar', blob);
        const res = await $fetch('/api/account/avatar', {
            method: 'PUT',
            body: formData,
        });
        if (res.status === 200) {
            loading.value = false;
            toast.add({ title: t('generic.success'), description: t('settings.pictureUpdated'), color: 'success' });
        } else {
            toast.add({ title: t('generic.error'), description: t('settings.pictureFailed'), color: 'error' });
        }
    }, 'image/webp');
}

const imagePreviews = ref(null);
function processFile(file) {
    if (!file) {
        return;
    }

    // Load the data into an image
    new Promise((resolve, reject) => {
        let rawImage = new Image();
        rawImage.addEventListener("load", () => {
            resolve(rawImage);
        });
        if (file instanceof File) {
            rawImage.src = URL.createObjectURL(file);
        } else {
            console.error("Invalid file object");
        }
    }).then((rawImage) => {
        // Convert image to webp ObjectURL via a canvas blob
        return new Promise((resolve, reject) => {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            canvas.width = rawImage.width;
            canvas.height = rawImage.height;
            ctx.drawImage(rawImage, 0, 0);
            scaledPicture.value = canvas;

            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, "image/webp");
        });
    }).then((imageURL) => {
        // Load image for display on the page
        return new Promise((resolve, reject) => {
            let scaledImg = new Image();
            scaledImg.addEventListener("load", () => {
                resolve({ imageURL, scaledImg });
            });
            scaledImg.setAttribute("src", imageURL);
            scaledImg.setAttribute("alt", t('settings.imgPreview'));
            scaledImg.setAttribute("class", "preview-image");
        });
    }).then((data) => {
        imagePreviews.value.innerHTML = "";
        imagePreviews.value.appendChild(data.scaledImg);
    });
}

async function deleteProfilePicture() {
    await $fetch('/api/account/avatar', {
        method: 'DELETE',
    }).then((res) => {
        if (res.status === 200) {
            toast.add({ title: t('generic.success'), description: t('settings.pictureDeleted'), color: 'success' });
        } else {
            toast.add({ title: t('generic.error'), description: t('settings.failedToDelete'), color: 'error' });
        }
    });
}

const handleFileUpload = (e) => {
    const file = e[0];
    if (file) {
        picture.value = file;
        fileSize.value = `${(file.size / 1000000).toFixed(2)} MB`;
        processFile(file);
    }
}

async function changePassword() {
    if (loadingChangePassword.value) {
        return;
    }

    if (newPassword.value.length < 8) {
        toast.add({ title: t('generic.error'), description: t('settings.passwordLength'), color: 'error' });
        return;
    }

    loadingChangePassword.value = true;

    await $fetch('/api/account/changepassword', {
        method: 'POST',
        body: {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
        },
    }).then((res) => {
        setTimeout(() => {
            loadingChangePassword.value = false;
        }, 1000);
        if (res.status === 200) {
            toast.add({ title: t('generic.success'), description: t('settings.passwordChanged'), color: 'success' });
            currentPassword.value = '';
            newPassword.value = '';
        } else {
            toast.add({ title: t('generic.error'), description: res.message, color: 'error' });
        }
    });
}
</script>

<style scoped>
.scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--color-neutral-700);
}

.scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
</style>