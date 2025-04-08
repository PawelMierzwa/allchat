<template>
  <UContainer class="flex flex-col justify-between my-auto font-mono">
    <h1 class="text-5xl text-center" v-if="data">{{ data.username + $t('user.profile') }}</h1>
    <h1 class="text-5xl text-center" v-else>{{ $t('generic.loading') }}</h1>
    <div v-if="data"
      class="flex flex-col items-center justify-between mt-10 w-full p-8 bg-neutral-100 dark:bg-neutral-900 rounded-md">
      <div class="flex flex-row items-center justify-between lg:gap-16 md:gap-8 gap-4">
        <div>
          <div class="flex items-center gap-4">
            <UAvatar :src="useRuntimeConfig().public.imgUrl + id + '.webp'" :alt="data.username.toUpperCase()"
              size="3xl" />
            <div>
              <h2 class="text-3xl">{{ data.username }}</h2>
            </div>
          </div>
        </div>
        <!-- Show edit button only when viewing your own profile -->
        <UButton variant="link" to="/settings#Account" v-if="isCurrentUser">{{ $t('profile.edit') }}</UButton>
      </div>
      <UDivider class="my-4 w-1/2" />
      <div v-if="data.stats" class="flex flex-col items-center justify-between">
        <h3 class="text-xl">{{ $t('profile.stats') }}</h3>
        <table class="[&>*>tr>td]:p-2 w-full h-full">
          <tbody>
            <tr>
              <td class="font-bold">{{ $t('profile.messages') }}:</td>
              <td>{{ data.stats.totalMessages }}</td>
            </tr>
            <tr>
              <td class="font-bold">{{ $t('profile.rooms') }}:</td>
              <td>{{ data.stats.totalRoomsDiscovered }}</td>
            </tr>
            <tr>
              <td class="font-bold">{{ $t('profile.joined') }}:</td>
              <td>{{ data.stats.totalRoomsJoined }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="data.message" class="text-center">
        <p>{{ $t('profile.error') }}</p>
        <p class="text-red-300">{{ data.code }}, {{ data.message }}</p>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
const route = useRoute()
const { id } = route.params
const sessionStore = useSessionStore()
const currentUser = computed(() => sessionStore.user)
const isCurrentUser = computed(() => currentUser.value.id === id)

definePageMeta({
  middleware: ['auth', 'owner']
})

const { t } = useI18n()

useHead({
  title: t('user.title'),
});

const { data, error } = await useFetch('/api/user/' + id + '/stats')
</script>