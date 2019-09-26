<template>
  <dashboard-card class="card-stretch">
    <v-card-text>
      <v-row>
        <v-col cols="4" class="info-block">
          <p class="label">Status</p>
          <p class="value">{{ status }}</p>
        </v-col>
        <v-col cols="4" class="info-block">
          <p class="label">Errors</p>
          <p class="value">{{ errors.length }}</p>
        </v-col>
        <v-col cols="4" class="info-block">
          <p class="label">Warnings</p>
          <p class="value">{{ warnings.length }}</p>
        </v-col>
        <v-col cols="4" class="info-block" align-center justifer-center>
          <p class="label">Assets</p>
          <p class="value">{{ assetsSize | size('B') }}</p>
        </v-col>
        <v-col cols="4" class="info-block">
          <p class="label">Modules</p>
          <p class="value">{{ modulesSize | size('B') }}</p>
        </v-col>
        <v-col cols="4" class="info-block">
          <p class="label">Dependencies</p>
          <p class="value">{{ depModulesSize | size('B') }}</p>
        </v-col>
      </v-row>
    </v-card-text>
  </dashboard-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { size } from '@/utils/filters'
import { capitalizeFirstLetter } from '@/utils/string'

export default {
  filters: {
    size
  },
  computed: {
    ...mapState('webpack', {
      job: 'currentJob'
    }),
    ...mapGetters('webpack', [
      'errors',
      'warnings',
      'assetsSize',
      'modulesSize',
      'depModulesSize'
    ]),
    status() {
      switch (this.job.state) {
        case 'ready':
          return 'Success'
        default:
          return capitalizeFirstLetter(this.job.state)
      }
    }
  }
}
</script>
