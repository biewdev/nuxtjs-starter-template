import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/scripts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  devtools: { enabled: true, telemetry: false, timeline: { enabled: true } },
  css: ['~/assets/css/main.css'],
  dir: {
    app: 'app',
    public: 'public',
    middleware: 'middlewares',
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  app: {
    head: {
      title: 'NuxtJS | Template',
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },
  fonts: {
    defaults: {
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
});
