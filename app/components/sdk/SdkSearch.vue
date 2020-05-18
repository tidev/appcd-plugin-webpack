<template>
  <dashboard-card :loading="isInstalling">
    <v-toolbar flat class="justify-center">
      <v-text-field
        v-model="filter"
        hide-details
        prepend-icon="$search"
        single-line
        clearable
      ></v-text-field>
      <v-checkbox
        v-model="nightly"
        hide-details
        label="Nightly"
        color="primary"
        class="pl-2"
      />
    </v-toolbar>

    <v-fade-transition hide-on-leave>
      <v-card-text v-if="isInstalling">
        <div class="text-center py-6">
          <p>
            <v-icon size="64" color="primary">$cloudDownload</v-icon>
          </p>
          <h2 class="pb-3">Installing ...</h2>
          <p>
            The SDK will now be downloaded and installed in the background. You
            can safely leave this page without interrupting the install process.
          </p>
        </div>
      </v-card-text>

      <v-card-text v-else-if="showPostInstallMessage">
        <div class="text-center py-6">
          <p>
            <v-icon size="64" :color="installResultIconColor">
              {{ installResultIcon }}
            </v-icon>
          </p>
          <p>
            {{ postInstallMessage }}
          </p>
          <v-btn color="primary" @click="clearSearch()">
            OK
          </v-btn>
        </div>
      </v-card-text>

      <v-card-text v-else-if="showSearchHint">
        <div class="text-center py-6">
          <p>
            <v-icon size="64" color="primary">$cloudSearch</v-icon>
          </p>
          <p>
            Here you can search and install new SDK versions. Tick the nightly
            checkbox to search for available branches and install latest nightly
            builds.
          </p>
        </div>
      </v-card-text>

      <v-card-text v-else-if="searchResults.length === 0 && !showLoader">
        <div class="text-center py-6">
          <p>
            <v-icon size="64" color="primary">$cloudSearch</v-icon>
          </p>
          <p>
            No matching {{ nightly ? 'branches' : 'releases' }} found. Try a
            different search term, e.g. {{ nightly ? '8_0_X' : '8.2.0' }}
          </p>
        </div>
      </v-card-text>

      <v-skeleton-loader
        v-else-if="showLoader"
        type="heading, button, heading, button, heading, button"
        class="results-loader"
      />
      <v-list v-else two-line>
        <v-list-item v-for="result in searchResults" :key="result.name">
          <v-list-item-content>
            <v-list-item-title>
              {{ result.name }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="isAlreadyInstalled(result.name)">
              Already installed.
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              v-if="isAlreadyInstalled(result.name)"
              color="warning"
              @click="install(result.name, true)"
            >
              Re-install
            </v-btn>
            <v-btn v-else color="primary" @click="install(result.name)">
              Install
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-fade-transition>
  </dashboard-card>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'

import { base } from '@/utils/appcd'
import { debounce } from '@/utils/events'
import { normalizeReleases } from '@/utils/sdk'

const withBase = base('titanium', '1.7.0')

export default {
  data: () => ({
    filter: '',
    nightly: false,
    searchResults: [],
    showLoader: false,
    showSearchHint: true,
    showNoResults: false,
    showPostInstallMessage: false
  }),
  computed: {
    ...mapState('sdk', ['installed', 'installing', 'lastInstall']),
    isInstalling() {
      return this.installing !== null
    },
    postInstallMessage() {
      if (!this.lastInstall.success) {
        return `Installation failed. ${this.lastInstall.message}`
      }

      let message = 'Succesfully installed '
      if (this.nightly) {
        message += `latest nightly build from branch ${this.lastInstall.sdkVersion}.`
      } else {
        message += `SDK ${this.lastInstall.sdkVersion}.`
      }
      return message
    },
    installResultIcon() {
      if (this.lastInstall.success) {
        return '$check'
      } else {
        return '$alert'
      }
    },
    installResultIconColor() {
      if (this.lastInstall.success) {
        return 'primary'
      } else {
        return 'error'
      }
    }
  },
  watch: {
    filter(value) {
      if (!value || value.length === 0) {
        this.clearSearch()
      } else {
        this.debouncedSearch()
      }
    },
    nightly(value) {
      if (this.filter && this.filter.length > 0) {
        this.search()
      }
    },
    installing(newValue, oldValue) {
      if (newValue === null && typeof oldValue === 'string') {
        this.showPostInstallMessage = true
      }
    }
  },
  created() {
    this.debouncedSearch = debounce(this.search, 200)
  },
  methods: {
    async search() {
      const url = withBase(`sdk/${this.nightly ? 'branches' : 'releases'}`)
      this.showSearchHint = false
      this.showLoader = true
      try {
        const { data } = await this.$axios.get(url, { progress: false })
        if (this.filter.length === 0) {
          this.clearSearch()
          return
        }
        let results = this.normalizeResults(data)
        results = results.filter(result => result.name.includes(this.filter))
        results.reverse()
        this.showLoader = false
        Vue.set(this, 'searchResults', results)
      } catch (e) {
        Vue.set(this, 'searchResults', [])
        this.showLoader = false
        this.showNoResults = true
      }
    },
    clearSearch() {
      this.showLoader = false
      this.showNoResults = false
      this.showPostInstallMessage = false
      this.showSearchHint = true
      this.filter = ''
      Vue.set(this, 'searchResults', [])
    },
    normalizeResults(data) {
      if (this.nightly) {
        return data.branches.map(branchName => {
          const meta = { name: branchName }
          if (branchName === data.defaultBranch) {
            meta.default = true
          }
          return meta
        })
      } else {
        delete data.latest
        return normalizeReleases(data)
      }
    },
    isAlreadyInstalled(sdkVersion) {
      return this.installed.some(sdk => sdk.name === sdkVersion)
    },
    install(sdkVersion, overwrite = false) {
      this.$store.dispatch('sdk/install', {
        sdkVersion,
        overwrite
      })
    }
  }
}
</script>

<style lang="sass">
.results-loader
  &.v-skeleton-loader
    align-items: center
    display: flex
    justify-content: space-between
    align-content: flex-start
    flex-wrap: wrap
    padding: 16px
    .v-skeleton-loader
      &__heading
      flex: 1 0 auto
      &__button
        margin: 6px 0
</style>
