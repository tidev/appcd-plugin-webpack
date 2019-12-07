<template>
  <v-container>
    <v-row>
      <v-col cols="4" xs="12">
        <stats-card
          icon="$webpack"
          title="Active Builds"
          :value="activeBuilds.length.toString()"
          sub-icon="$tag"
          :sub-text="activeBuildsSubText"
        />
      </v-col>
      <v-col cols="4" xs="12">
        <stats-card
          color="green"
          icon="$timerSand"
          title="Idle builds"
          :value="idleBuilds.length.toString()"
          sub-icon="$accountClock"
          sub-text="Watching for changes ..."
        />
      </v-col>
      <v-col cols="4" xs="12">
        <stats-card
          color="red"
          icon="$alert"
          title="Errors"
          :value="erroredBuilds.length.toString()"
          sub-icon="$checkboxMarked"
          :sub-text="erroredBuildsSubText"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <dashboard-card class="card-tabs">
          <v-card-title>
            <v-flex>
              <v-tabs v-model="tabs" slider-color="white">
                <span
                  class="font-weight-light mr-4 primary--text"
                  style="align-self: center"
                >
                  Filter:
                </span>
                <v-tab class="mr-3">
                  <v-icon class="mr-2">$webpack</v-icon>
                  All
                </v-tab>
                <v-tab class="mr-3">
                  <v-icon class="mr-2">$information</v-icon>
                  Error
                </v-tab>
                <v-tab>
                  <v-icon class="mr-2">$stopCircle</v-icon>
                  Stopped
                </v-tab>
              </v-tabs>
            </v-flex>
          </v-card-title>

          <v-list v-if="items.length">
            <v-list-item
              v-for="item in items"
              :key="item.id"
              :to="{ name: 'webpack-build-id', params: { id: item.id } }"
              nuxt
              three-line
            >
              <v-list-item-avatar :class="[getIconClass(item)]">
                <v-icon size="24" class="white--text">
                  {{ getIcon(item) }}
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.projectPath }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <div class="d-flex align-center">
                    <type-label :type="item.projectType"></type-label>
                    <span class="px-2 grey--text text--lighten-1">|</span>
                    <platform-label :platform="item.platform"></platform-label>
                    <span class="px-2 grey--text text--lighten-1">|</span>
                    <status-label :status="item.state"></status-label>
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-row justify="center">
            <v-col cols="8">
              <v-alert
                :value="items.length === 0"
                color="info"
                icon="$alert"
                border="left"
                prominent
                dark
              >
                There are currently no active Webpack builds.
              </v-alert>
            </v-col>
          </v-row>
        </dashboard-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import StatsCard from '@/components/StatsCard'
import utilityMixin from '@/utils/mixin'

export default {
  components: {
    StatsCard
  },
  mixins: [utilityMixin],
  data: () => ({
    tabs: null
  }),
  computed: {
    ...mapState('webpack', {
      items: 'jobs'
    }),
    ...mapGetters('webpack', ['activeBuilds', 'idleBuilds', 'erroredBuilds']),
    activeBuildsSubText() {
      const length = this.activeBuilds.length
      if (length > 0) {
        const plural = length > 0
        return `There ${plural ? 'are' : 'is'} ${length}
          ${plural ? 'builds' : 'build'} active.`
      } else {
        return 'No builds are currently active'
      }
    },
    erroredBuildsSubText() {
      const length = this.erroredBuilds.length
      if (length > 0) {
        const plural = length > 1
        return `There ${plural ? 'are' : 'is'} ${length}
          ${plural ? 'builds' : 'build'} with errors.`
      }

      return 'No builds with errors'
    }
  },
  async fetch({ error, store }) {
    try {
      await store.dispatch('webpack/fetchJobs')
    } catch (e) {
      error({ message: 'Failed to get Webpack job list from Daemon.' })
    }
  },
  head: () => ({
    title: 'Webpack'
  })
}
</script>

<style lang="sass">
.stats-value
  font-size: 48px
</style>