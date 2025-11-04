// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/icon'
  ],
  hooks: {
    'pages:extend'(pages) {
      const profileRoute = pages.find(page => page.name === 'profiles-username');
      if (profileRoute) {
        profileRoute.path = '/@:username';
      }
      const memoryRoute = pages.find(page => page.name === 'profiles-username-id');
      if (memoryRoute) {
        memoryRoute.path = '/@:username/:id';
      }
    }
  },
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
        '/user/password-update',
        '/@.*'
      ]
    }
  }
});
