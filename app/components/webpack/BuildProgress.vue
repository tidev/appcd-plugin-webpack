<template>
  <dashboard-card class="card-stretch align-center justify-center">
    <v-progress-circular
      color="primary"
      size="150"
      width="20"
      rotate="-90"
      :value="progress"
    >
      {{ progress }}
    </v-progress-circular>
    <div class="progress-message">{{ message }}</div>
  </dashboard-card>
</template>

<script>
import { mapState } from 'vuex'

import { capitalizeFirstLetter } from '@/utils/string'

export default {
  computed: {
    ...mapState('webpack', {
      job: 'currentJob'
    }),
    message() {
      switch (this.job.state) {
        case 'ready':
          return this.idleMessage
        case 'building':
          return this.job.progress.message || 'building'
        default:
          return capitalizeFirstLetter(this.job.state)
      }
    },
    progress() {
      if (this.job.state === 'stopped') {
        return 0
      } else if (this.job.state !== 'ready') {
        return this.job.progress.progress
      } else {
        return 100
      }
    },
    idleMessage() {
      if (this.job.history.length > 0) {
        const buildTimestamp = this.job.history[0].timestamp
        const idleTime = Math.floor(
          (Date.now() - new Date(buildTimestamp).getTime()) / 1000
        )
        let idleSince
        if (idleTime < 60) {
          idleSince = `${idleTime}s`
        } else if (idleTime < 3600) {
          idleSince = `${Math.floor(idleTime / 60)}m`
        } else if (idleTime < 86400) {
          idleSince = `${Math.floor(idleTime / 3600)}h`
        } else {
          idleSince = `${Math.floor(idleTime / 86400)}d`
        }
        return `Idle (${idleSince})`
      }

      return 'Idle'
    }
  }
}
</script>

<style lang="sass">
.progress-message
  padding-top: 20px
</style>
