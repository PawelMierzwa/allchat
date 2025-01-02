<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator :throttle="0" color="orange" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
