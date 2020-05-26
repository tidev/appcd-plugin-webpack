<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <sdk-list />
      </v-col>
      <v-col cols="6">
        <v-scale-transition>
          <update-notification
            v-if="updateAvailable"
            :install-sdk="latestRelease"
            class="mb-5"
          />
        </v-scale-transition>
        <sdk-search />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { SdkList, SdkSearch, UpdateNotification } from '@/components/sdk'

export default {
  components: {
    SdkList,
    SdkSearch,
    UpdateNotification
  },
  async fetch({ store }) {
    await store.dispatch('sdk/fetchInstalled')
    await store.dispatch('sdk/fetchReleases')
  },
  computed: {
    ...mapState('sdk', ['installed', 'latestRelease']),
    ...mapGetters('sdk', ['updateAvailable'])
  }
}
</script>
