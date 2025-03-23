<template>
    <div class="flex flex-col justify-between gap-4 w-full p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md">
        <div class="flex flex-row items-center justify-between gap-4">
            <p class="text-center">Language</p>
            <USelect size="lg" v-model="language" :items="languages" @change="handleLanguageChange" />
        </div>
        <div class="flex my-1 flex-row items-center justify-between gap-4">
            <p class="text-center">Link previews</p>
            <USwitch size="lg" v-model="linkPreviews" @change="handleLPChange" />
        </div>
        <div class="flex my-1 flex-row items-center justify-between gap-4">
            <p class="text-center">Sound notifications</p>
            <USwitch size="lg" v-model="soundOn" @change="handleSoundOnChange" />
        </div>
        <div class="flex flex-row items-center justify-between gap-4">
            <p :data-sound="soundOn" class="text-center data-[sound=false]:text-neutral-500 data-[sound=false]:cursor-not-allowed">Notification sound</p>
            <USelect size="lg" v-model="selectedNotif" :items="notificationSounds" :disabled="!soundOn" @change="handleNotifChange" class="hover:cursor-pointer" />
        </div>
    </div>
</template>

<script setup>
const languages = ['en', 'pl', 'fr', 'ua', 'de', 'es', 'it', 'de'];
const language = ref('en');
const { setLocale } = useI18n();

function handleLanguageChange() {
    localStorage.setItem('locale', language.value);
    setLocale(language.value);
}

const linkPreviews = ref(true);
function handleLPChange() {
    localStorage.setItem('linkPreviews', linkPreviews.value);
}

const soundOn = ref(true);
function handleSoundOnChange() {
    localStorage.setItem('soundOn', soundOn.value);
}

const notificationSounds = [
    { label: 'Default', value: 'default' },
    { label: 'Ding', value: 'ding' },
    { label: 'Pop', value: 'pop' },
    { label: 'Ting', value: 'ting' },
    { label: 'Whoosh', value: 'whoosh' },
];
const selectedNotif = ref('default');
function handleNotifChange() {
    localStorage.setItem('notificationSound', selectedNotif.value);
}

onMounted(() => {
    const storedLang = localStorage.getItem('locale');
    if (storedLang) {
        language.value = storedLang;
    }
    const storedNotif = localStorage.getItem('notificationSound');
    if (storedNotif) {
        selectedNotif.value = storedNotif;
    }
    const storedLP = localStorage.getItem('linkPreviews');
    if (storedLP) {
        linkPreviews.value = storedLP === 'true';
    }
    const storedSound = localStorage.getItem('soundOn');
    if (storedSound) {
        soundOn.value = storedSound === 'true';
    }
});

</script>