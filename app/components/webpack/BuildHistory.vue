<template>
  <dashboard-card class="card-stretch build-history">
    <v-card-title>
      Build History
    </v-card-title>
    <stats-loading v-if="!history.length" />
    <v-list v-else height="275">
      <v-list-item v-for="item in history" :key="item.id" three-line>
        <v-list-item-avatar :class="[getIconClass(item)]">
          <v-icon size="24" class="white--text">
            {{ getIcon(item) }}
          </v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>
            <timeago :datetime="item.timestamp" :auto-update="60" />
          </v-list-item-title>
          <v-list-item-subtitle>
            <span class="primary--text text--darken-1">
              {{ formatBuildTrigger(item) }}
            </span>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            {{ item.message }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </dashboard-card>
</template>

<script>
import { mapState } from 'vuex'

import utilsMixin from '@/utils/mixin'
import StatsLoading from './StatsLoading'

export default {
  components: {
    StatsLoading
  },
  mixins: [utilsMixin],
  computed: {
    ...mapState('webpack', {
      job: 'currentJob'
    }),
    history() {
      return this.job.history.map((entry, index) => {
        const historyEntry = Object.assign({}, entry)
        if (index > 0 && index < this.job.history.length) {
          historyEntry.divider = true
        }

        let state = 'ready'
        if (entry.hasErrors) {
          state = 'error'
        } else if (entry.hasWarnings) {
          state = 'warning'
        }
        historyEntry.state = state

        return historyEntry
      })
    }
  },
  methods: {
    formatBuildTrigger(item) {
      if (item.invalid) {
        const relativePath = item.invalid.replace(this.job.projectPath, '.')
        return `Triggered by change in ${relativePath}`
      } else {
        return 'Initial build'
      }
    }
  }
}
</script>

<style lang="sass">
.build-history
  .v-list
    overflow-y: scroll
</style>
