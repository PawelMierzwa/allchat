<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator :throttle="0" color="orange" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>
