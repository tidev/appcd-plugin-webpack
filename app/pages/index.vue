<template>
  <v-container>
    <v-row>
      <v-col cols="4" xs="12">
        <stats-card
          icon="mdi-webpack"
          title="Active Builds"
          :value="activeBuilds.length.toString()"
          sub-icon="mdi-tag"
          sub-text="No jobs are currently active"
        />
      </v-col>
      <v-col cols="4" xs="12">
        <stats-card
          color="green"
          icon="mdi-timer-sand"
          title="Idle builds"
          :value="idleBuilds.length.toString()"
          sub-icon="mdi-account-clock-outline"
          sub-text="Watching for changes ..."
        />
      </v-col>
      <v-col cols="4" xs="12">
        <stats-card
          color="red"
          icon="mdi-alert"
          title="Errors"
          :value="erroredBuilds.length.toString()"
          sub-icon="mdi-checkbox-marked-circle"
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
                  <v-icon class="mr-2">mdi-webpack</v-icon>
                  All
                </v-tab>
                <v-tab class="mr-3">
                  <v-icon class="mr-2">mdi-information-outline</v-icon>
                  Error
                </v-tab>
                <v-tab>
                  <v-icon class="mr-2">mdi-stop-circle-outline</v-icon>
                  Stopped
                </v-tab>
              </v-tabs>
            </v-flex>
          </v-card-title>

          <v-list v-if="items.length">
            <v-list-item
              v-for="item in items"
              :key="item.id"
              :to="{ name: 'build-id', params: { id: item.id } }"
              nuxt
              three-line
            >
              <v-list-item-avatar>
                <v-icon :class="[getIconClass(item)]">
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
                    <type-label :type="item.type"></type-label>
                    <span class="px-2 grey--text text--lighten-1">|</span>
                    <platform-label :platform="item.platform"></platform-label>
                    <span class="px-2 grey--text text--lighten-1">|</span>
                    <status-label :status="item.state"></status-label>
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn icon ripple @click.stop="stopJob(item)">
                  <v-icon color="red lighten-1">mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-row justify="center">
            <v-col cols="8">
              <v-alert
                :value="items.length === 0"
                color="info"
                icon="mdi-alert"
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
      error({ message: 'Failed to get Webpack job list from daemon.' })
    }
  },
  head: () => ({
    title: 'Webpack'
  }),
  methods: {
    stopJob(job) {
      this.$store.dispatch('webpack/stopJob', job.id)
    }
  }
}
</script>

<style lang="sass">
.stats-value
  font-size: 48px
</style>
