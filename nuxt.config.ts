// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  runtimeConfig: {
    jwtSecret: '',
    jwtAlg: '',
    imgUploadUrl: '',
    workerSecret: '',
    public: {
      imgUrl: '',
    }
  },
  nitro: {
    experimental: {
      database: true,
      websocket: true,
    },
    database: {
      users: {
        connector: 'sqlite',
        options: {
          name: 'users',
        }
      },
      chat: {
        connector: 'sqlite',
        options: {
          name: 'chat',
        }
      },
    }
  },
  colorMode: {
    preference: 'dark',
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    defaultLocale: 'en',
    strategy: 'no_prefix',
  },
  css: ['~/assets/css/main.css'],
})