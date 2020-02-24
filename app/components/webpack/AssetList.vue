<template>
  <dashboard-card class="card-stretch webpack-stats-card">
    <v-card-title>Assets</v-card-title>
    <v-card-text class="pa-0">
      <stats-loading v-if="!assets.length" />
      <v-list v-else dense height="210">
        <v-list-item v-for="asset in items" :key="asset.name">
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
        <div v-intersect.quiet="showMore"></div>
      </v-list>
    </v-card-text>
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
  data: () => ({
    maxAssets: 20
  }),
  computed: {
    ...mapGetters('webpack', ['assets']),
    items() {
      return this.assets.slice(0, Math.min(this.maxAssets, this.assets.length))
    }
  },
  methods: {
    getTypeIcon(fileName) {
      const ext = fileName.substr(fileName.lastIndexOf('.') + 1)
      switch (ext) {
        case 'js':
          return '$javascript'
        case 'gif':
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'svg':
          return '$image'
        case 'mp3':
        case 'wav':
          return '$music'
        case 'mp4':
        case 'mpeg':
        case 'mov':
          return '$video'
        case 'otf':
        case 'ttf':
        case 'woff':
          return '$font'
        case 'xml':
          return '$xml'
        case 'db':
          return '$database'
        default:
          return '$fileQuestion'
      }
    },
    showMore(entries, observer) {
      this.maxAssets += 20
    }
  }
}
</script>
