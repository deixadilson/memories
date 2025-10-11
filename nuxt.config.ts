// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/icon'
  ], 
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/user/login',
      callback: '/user/confirm',
      exclude: [
        '/',
        '/user/register',
        '/user/password-reset',
        '/user/password-update'
      ]
    }
  }
});
