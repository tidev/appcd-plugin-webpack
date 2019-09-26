<template>
  <dashboard-card class="card-stretch webpack-stats-card">
    <v-card-title>Assets</v-card-title>
    <v-card-text class="pa-0">
      <stats-loading v-if="!assets.length" />
      <v-list v-else dense height="210">
        <v-list-item v-for="asset in assets" :key="asset.name">
          <v-list-item-icon>
            <v-icon
              class="primary--text"
              v-text="getTypeIcon(asset.name)"
            ></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="grey--text text--darken-2">
              {{ asset.name }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="asset-size">
            <v-list-item-action-text>
              {{ asset.size | size('B') }}
            </v-list-item-action-text>
            <v-progress-linear :value="asset.ratio * 100"></v-progress-linear>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
  </dashboard-card>
</template>

<script>
import { mapGetters } from 'vuex'

import StatsLoading from './StatsLoading'
import { size } from '@/utils/filters'

export default {
  components: {
    StatsLoading
  },
  filters: {
    size
  },
  computed: {
    ...mapGetters('webpack', ['assets'])
  },
  methods: {
    getTypeIcon(fileName) {
      const ext = fileName.substr(fileName.lastIndexOf('.') + 1)
      switch (ext) {
        case 'js':
          return 'mdi-language-javascript'
        case 'gif':
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'mdi-image-outline'
        case 'otf':
          return 'mdi-format-font'
        default:
          return 'mdi-file-question-outline'
      }
    }
  }
}
</script>
