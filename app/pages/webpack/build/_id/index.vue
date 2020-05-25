<template>
  <v-container fill-height flex-column align-stretch flex-grid>
    <v-row dense class="header">
      <v-col cols="12" class="pa-0">
        <v-breadcrumbs :items="breadcrumbItems" divider=">"></v-breadcrumbs>
        <div class="d-flex align-center grey--text build-info">
          <span class="px-2">|</span>
          <type-label :type="job.projectType" />
          <span class="px-2">|</span>
          <platform-label :platform="job.platform" />
        </div>
      </v-col>
      <v-col cols="6">
        <v-btn
          v-if="job.state === 'stopped' || job.state === 'error'"
          color="primary"
          :loading="isStarting"
          class="btn-start"
          @click="startJob()"
        >
          Start Build
          <v-icon right>$play</v-icon>
          <template v-slot:loader>
            Starting
            <span class="pl-2">
              <v-progress-circular indeterminate size="18" width="3" />
            </span>
          </template>
        </v-btn>
        <v-btn v-else color="primary" dark @click="stopJob()">
          Stop Build
          <v-icon right>$stop</v-icon>
        </v-btn>
        <BuildSettingsDialog />
      </v-col>
      <v-col cols="6" class="justify-end">
        <v-btn-toggle v-model="viewToggle" mandatory color="primary">
          <v-btn><v-icon left>$viewGrid</v-icon> Dashboard</v-btn>
          <v-btn><v-icon left>$console</v-icon> Output</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row v-if="viewToggle == 0" class="content flex-grid">
      <v-col cols="8">
        <build-status />
      </v-col>
      <v-col cols="4">
        <build-progress />
      </v-col>
      <v-col cols="8">
        <asset-list />
      </v-col>
      <v-col cols="4">
        <deps-list />
      </v-col>
      <v-col cols="6">
        <build-history />
      </v-col>
      <v-col cols="6">
        <api-usage />
      </v-col>
    </v-row>
    <v-row v-else dense class="content">
      <v-col cols="12">
        <client-only>
          <terminal-view :content="job.output" />
        </client-only>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

import {
  ApiUsage,
  AssetList,
  BuildHistory,
  BuildProgress,
  BuildSettingsDialog,
  BuildStatus,
  DepsList
} from '@/components/webpack'
import utilityMixin from '@/utils/mixin'

export default {
  components: {
    ApiUsage,
    AssetList,
    BuildHistory,
    BuildProgress,
    BuildSettingsDialog,
    BuildStatus,
    DepsList,
    TerminalView: () => import('@/components/TerminalView')
  },
  mixins: [utilityMixin],
  data: () => ({
    isStarting: false,
    viewToggle: 0,
    progress: {
      progress: 0,
      message: '',
      details1: '',
      details2: '',
      request: ''
    }
  }),
  computed: {
    ...mapState('webpack', {
      job: 'currentJob'
    }),
    breadcrumbItems() {
      return [
        {
          text: 'Webpack',
          to: '/webpack',
          exact: true
        },
        {
          text: this.job.name,
          disabled: true
        }
      ]
    }
  },
  async fetch({ error, params, store }) {
    try {
      await store.dispatch('webpack/fetchJob', params.id)
    } catch (e) {
      error({ statusCode: 404, message: 'Job not found' })
    }
  },
  head() {
    return {
      title: `Webpack - ${this.job.name}`
    }
  },
  async mounted() {
    this.subscription = await this.$subscribe(
      `/webpack/latest/status/${this.job.id}`
    )
    this.subscription.on('message', data => {
      const event = data.event
      delete data.event
      if (event === 'done') {
        this.$store.commit('webpack/addHistory', data.historyEntry)
        this.$store.commit('webpack/stats', data.stats)
      } else {
        this.$store.commit('webpack/updateJob', data)
      }
    })
  },
  beforeDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  },
  methods: {
    async startJob() {
      try {
        this.isStarting = true
        await this.$store.dispatch('webpack/startJob', {
          identifier: this.job.id
        })
        this.isStarting = false
      } catch (e) {
        this.isStarting = false
      }
    },
    stopJob() {
      this.$store.dispatch('webpack/stopJob', this.job.id)
    }
  }
}
</script>

<style lang="sass">
.flex-grid
  > .row
    > .col
      display: flex
.container
  &.fill-height
    .row
      &.header
        flex: 0 0 auto
        .v-btn-toggle
          > .v-btn.v-size--default
            height: 36px
        .build-info
          font-size: 14px
      &.content
        flex: auto 1 1
.info-block
  padding: 30px 12px
  text-align: center
  font-weight: 300
  p
    margin-bottom: 8px
  .label
    font-size: 1.3em
  .value
    font-size: 2.0em
    color: rgba(0, 0, 0, 0.87)

.webpack-stats-card
  .v-list
    overflow-y: scroll
    .asset-size
      width: 60px
      &.v-list-item__action
        margin: 6px 0 0 0
        justify-content: start
</style>
