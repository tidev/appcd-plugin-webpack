const path = require('path')

module.exports = {
  mode: 'spa',
  rootDir: path.resolve(__dirname, '..'),
  srcDir: 'app',
  buildDir: 'app/.nuxt',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - Appcd UI [BETA]',
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
  loading: { color: '#00b3a4', failedColor: '#fb6e78' },
  /*
   ** Global CSS
   */
  css: ['@/assets/sass/main.sass'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/appcd-status.client.js',
    '@/plugins/global-components.js',
    '@/plugins/online-guard.client.js',
    '@/plugins/subscribtion.client.js',
    '@/plugins/timeago.js',
    '@/plugins/webpack-status.client.js'
  ],
  /*
   ** Nuxt.js build modules
   */
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify'
  ],
  /*
   ** Nuxt.js runtime modules
   */
  modules: [
    // '@nuxtjs/apollo',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
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
  proxy: {
    '/appcd': {
      target: 'http://localhost:1732',
      pathRewrite: {
        '^/appcd': ''
      }
    }
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    defaultAssets: {
      icons: false
    },
    optionsPath: './vuetify.options.js',
    treeShake: true
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

module.exports.default = module.exports