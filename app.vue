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
  background-image: url('/assets/bg.png');
  background-repeat: repeat;
  background-size: 50%;
  background-position-y: 10%;
}
</style>