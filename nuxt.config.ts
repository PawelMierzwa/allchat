// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  runtimeConfig: {
    jwtSecret: '',
    jwtAlg: '',
  },
  nitro: {
    experimental: {
      database: true,
    },
    database: {
      users: {
        connector: 'sqlite',
        options: {
          name: 'users',
        }
      },
      messages: {
        connector: 'sqlite',
        options: {
          name: 'messages',
        }
      },
    }
  },

})