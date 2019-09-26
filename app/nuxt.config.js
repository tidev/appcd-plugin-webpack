export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - Appcd UI',
    title: 'Appcd UI',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#00ad9e' },
  /*
   ** Global CSS
   */
  css: ['vue-resize/dist/vue-resize.css', '@/assets/sass/main.sass'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/global-components.js',
    '@/plugins/timeago.js',
    '@/plugins/resize.js'
  ],
  /*
   ** Nuxt.js build modules
   */
  buildModules: [
    '@nuxtjs/vuetify',
  ],
  /*
   ** Nuxt.js runtime modules
   */
  modules: [
    '@nuxtjs/apollo',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/eslint-module',
    '@nuxtjs/proxy'
  ],
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:4000',
        wsEndpoint: 'ws://localhost:4000'
      }
    }
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  proxy: [
    'http://localhost:1732/appcd/status',
    'http://localhost:1732/webpack/**/*'
  ],
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    optionsPath: './vuetify.options.js',
    treeShake: true
  },
  router: {
    middleware: ['online-check']
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
}
