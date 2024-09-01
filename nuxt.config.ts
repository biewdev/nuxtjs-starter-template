// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-snackbar',
    'nuxt-lodash',
  ],
  devtools: { enabled: true, telemetry: false, timeline: { enabled: true } },
  srcDir: 'src/',
  css: ['~/assets/css/main.scss'],
  dir: {
    public: '../public',
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  app: {
    head: {
      title: 'Nuxt Project',
    },
  },
  piniaPersistedstate: {
    storage: 'localStorage',
  },
  tailwindcss: {
    viewer: {
      exportViewer: false,
    },
  },
  // googleFonts: {
  // 	families: {
  // 		'Fira Sans': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  // 	},
  // },
  snackbar: {
    top: true,
    right: true,
    duration: 5000,
    dense: true,
    shadow: true,
    border: 'bottom',
  },
  lodash: {
    prefix: '_',
  },
});
