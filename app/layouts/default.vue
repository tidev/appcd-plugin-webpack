<template>
  <v-app>
    <v-app-bar fixed app clipped-left color="#0e1f25" dark>
      <v-toolbar-title>
        <nuxt-link to="/" class="d-flex title-link">
          <img src="~/assets/axway-logo.png" height="30" class="pr-3" />
          <span>Appcd Dashboard</span>
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn
          icon
          href="https://github.com/appcelerator/appc-daemon"
          target="_blank"
        >
          <v-icon>$github</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      color="grey lighten-4"
      :mobile-break-point="0"
      :disable-resize-watcher="true"
      :mini-variant="miniVariant"
    >
      <v-list class="grey lighten-4">
        <template v-for="(item, i) in navItems">
          <v-subheader v-if="item.heading" :key="i">
            {{ item.heading }}
          </v-subheader>
          <v-divider
            v-else-if="item.divider"
            :key="i"
            dark
            class="my-4"
          ></v-divider>
          <v-list-item
            v-else
            :key="i"
            active-class="primary--text"
            nuxt
            link
            :to="item.link"
          >
            <v-list-item-action>
              <v-icon color="primary">{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="grey--text">
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-slide-y-transition>
      <v-system-bar
        v-show="showConnectionAlert"
        fixed
        color="red"
        dark
        height="40"
        class="connection-alert"
      >
        <v-row>
          <v-col cols="12" class="text-center">
            <v-icon class="mr-3">$cloudOff</v-icon>
            <span>Disconnected from Appc Daemon!</span>
          </v-col>
        </v-row>
      </v-system-bar>
    </v-slide-y-transition>

    <v-content>
      <v-fade-transition>
        <nuxt />
      </v-fade-transition>
    </v-content>

    <v-footer class="grey--text" app dark color="#0e1e24">
      <span class="copyright">&copy; {{ currentDate }} Axway Appcelerator</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      drawer: null,
      items: [
        { heading: 'General' },
        { text: 'SDK', icon: '$titanium', link: '/titanium/sdk' },
        { heading: 'Build' },
        { text: 'Webpack', icon: '$webpack', link: '/webpack' }
      ],
      title: 'appcd-webpack'
    }
  },
  computed: {
    navItems() {
      return this.items.filter(i => {
        if (this.$vuetify.breakpoint.mdAndDown && i.heading) {
          return false
        }

        return true
      })
    },
    showConnectionAlert() {
      return !this.connected
    },
    ...mapState(['connected']),
    miniVariant() {
      return this.$vuetify.breakpoint.mdAndDown
    },
    currentDate() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.v-toolbar
  .title-link
    text-decoration: none
    color: map-deep-get($material-theme, 'text', 'theme')
.copyright
  font-size: 0.8rem

.theme--dark
  &.v-system-bar
    &.connection-alert
      z-index: 4
      top: 64px
      color: map-deep-get($material-dark, 'text', 'primary')
      & .v-icon
        color: map-deep-get($material-dark, 'text', 'primary')
</style>
