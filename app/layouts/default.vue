<template>
  <v-app>
    <v-app-bar fixed app clipped-left color="#0e1f25" dark>
      <v-toolbar-title>
        <v-list-item dense>
          <v-list-item-action>
            <img :src="require('@/assets/axway-logo.png')" height="30" />
          </v-list-item-action>
          <v-list-item-content>
            Appcd Dashboard
          </v-list-item-content>
        </v-list-item>
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-items class="hidden-sm-and-down">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              class="mx-3"
              size="16"
              :class="[connectionStateClass]"
              v-on="on"
            >
              mdi-checkbox-blank-circle
            </v-icon>
          </template>
          <span>{{ connectionTooltip }}</span>
        </v-tooltip>
        <v-btn
          icon
          href="https://github.com/appcelerator/appc-daemon"
          target="_blank"
        >
          <v-icon>mdi-github-circle</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app clipped color="grey lighten-4">
      <v-list class="grey lighten-4">
        <template v-for="(item, i) in items">
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
            to="/"
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

    <v-content>
      <nuxt />
    </v-content>

    <v-footer class="grey--text" app dark color="#0e1e24">
      <span class="copyright">&copy; 2019 Axway Appcelerator</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      drawer: null,
      items: [{ heading: 'Build' }, { text: 'Webpack', icon: 'mdi-webpack' }],
      title: 'appcd-webpack'
    }
  },
  computed: {
    connectionStateClass() {
      if (this.connected) {
        return 'success--text'
      } else {
        return 'grey--text text--lighten-2'
      }
    },
    connectionTooltip() {
      return this.connected ? 'Connected to Daemon' : 'Not connected to Daemon'
    },
    ...mapState('webpack', ['connected'])
  }
}
</script>

<style lang="sass">
.copyright
  font-size: 0.8rem
</style>
