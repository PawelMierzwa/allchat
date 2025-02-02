<template>
    <div class="flex flex-col items-center justify-between gap-4">
        <h2 class="text-lg mt-2">Profile</h2>
        <div class="flex flex-row items-center gap-4">
            <UAvatar :src="useRuntimeConfig().public.imgUrl + user.id" :alt="user.name.toUpperCase()" size="lg" />
            <div>
                <h2>{{ user.name }}</h2>
                <p>{{ user.email }}</p>
            </div>
        </div>
        <form class="flex flex-col items-center justify-between gap-4 w-full">
            <div class="row" style="gap: 5px; align-items: center;">
                <div class="flex flex-row items-center gap-1">
                    <UButton color="primary" rounded="xl" @click="openFilePicker = true">
                        Update Profile Picture
                    </UButton>
                    <UButton variant="ghost" color="red" @click="deleteProfilePicture" class->
                        <UIcon size="xl" class="text-xl" name="mdi-trash-can-outline" />
                    </UButton>
                </div>
                <UModal v-model="openFilePicker">
                    <UCard id="upload-card" class="border">
                        <div ref="imagePreviews" id="imagePreviews" :class="scaledPicture != null ? 'mb-2' : ''"></div>
                        <UInput v-model="picture" type="file" @change="handleFileUpload" size="lg" accept="image/png, image/jpeg"
                            icon="mdi-arrow-expand-up" label="Upload photo" id="file-upload">
                            <template #trailing>
                                <span class="text-gray-500 dark:text-gray-400 text-xs">{{ fileSize }}</span>
                            </template>
                        </UInput>
                        <template #footer>
                            <div class="flex flex-row items-center justify-between gap-4">
                                <UButton :disabled="!scaledPicture" color="primary"
                                    @click="uploadProfilePicture(); openFilePicker = false">Upload</UButton>
                                <UButton color="gray" @click="openFilePicker = false">Close</UButton>
                            </div>
                        </template>
                    </UCard>
                </UModal>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            openFilePicker: false,
            rules: [
                (v) => !!v || 'File is required',
                (v) => !v || v.size < 2000000 || 'File size must be less than 2 MB',
                (v) => !v || ['image/jpeg', 'image/png'].includes(v.type) || 'File must be an image (jpeg, png)'
            ],
        }
    },
    setup() {
        const sessionStore = useSessionStore();
        const user = computed(() => sessionStore.user);
        const open = ref(false);
        const loading = ref(false);
        const scaledPicture = ref(null);
        const picture = ref(null);
        const fileSize = ref("0 MB");
        const toast = useToast();

        const logout = function () {
            sessionStore.logout();
            open.value = false;
            const router = useRouter();
            router.push('/');
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
                toast.add({ title: 'Error', description: 'File size must be less than 2 MB', color: 'red' });
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
                    toast.add({ title: 'Success', description: 'Profile picture updated', color: 'green' });
                } else {
                    toast.add({ title: 'Error', description: 'Failed to upload profile picture', color: 'red' });
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
                    scaledImg.setAttribute("alt", "Preview of the image you are about to upload");
                    scaledImg.setAttribute("class", "preview-image");
                });
            }).then((data) => {
                imagePreviews.value.innerHTML = "";
                imagePreviews.value.appendChild(data.scaledImg);
            });
        }

        function deleteProfilePicture() {
            $fetch('/api/account/avatar', {
                method: 'DELETE',
            }).then((res) => {
                if (res.status === 200) {
                    toast.add({ title: 'Success', description: 'Profile picture deleted', color: 'green' });
                } else {
                    toast.add({ title: 'Error', description: 'Failed to delete profile picture', color: 'red' });
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

        return { user, logout, processFile, uploadProfilePicture, imagePreviews, scaledPicture, picture, fileSize, loading, open, handleFileUpload, deleteProfilePicture };
    },
}
</script>