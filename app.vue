<template>
  <div class="h-screen w-screen">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator :throttle="0" color="orange" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<style>
html,
body,
#__nuxt,
#__layout {
  height: 100% !important;
  width: 100% !important;
}
</style>