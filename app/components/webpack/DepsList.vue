<template>
  <dashboard-card class="card-stretch webpack-stats-card">
    <v-card-title>Dependencies</v-card-title>
    <stats-loading v-if="!depModules.length" />
    <v-list v-else dense height="210">
      <v-list-item v-for="dep in depModules" :key="dep.name">
        <v-list-item-content>
          <v-list-item-title class="grey--text text--darken-2">
            {{ dep.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action class="asset-size">
          <v-list-item-action-text>
            {{ dep.size | size('B') }}
          </v-list-item-action-text>
          <v-progress-linear :value="dep.ratio * 100"></v-progress-linear>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </dashboard-card>
</template>

<script>
import { mapGetters } from 'vuex'

import { size } from '@/utils/filters'
import StatsLoading from './StatsLoading'

export default {
  components: {
    StatsLoading
  },
  filters: {
    size
  },
  computed: {
    ...mapGetters('webpack', ['depModules'])
  }
}
</script>
