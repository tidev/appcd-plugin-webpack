<template>
  <dashboard-card>
    <v-card-title>
      Installed SDKs
    </v-card-title>

    <v-list two-line>
      <template v-for="(sdk, index) in installed">
        <v-list-item :key="sdk.name">
          <v-list-item-content>
            <v-list-item-title>{{ sdk.name }}</v-list-item-title>
            <v-list-item-subtitle class="d-flex align-center">
              <span class="pr-1">Platforms:</span>
              <div class="d-flex">
                <template v-for="(platform, pi) in sdk.manifest.platforms">
                  <platform-label :key="platform" :platform="platform" />
                  <span
                    v-if="pi < sdk.manifest.platforms.length - 1"
                    :key="`divider-${pi}`"
                    class="px-1 grey--text"
                  >
                    |
                  </span>
                </template>
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <div>
              <v-btn icon color="error" @click="confirmUninstall(sdk.name)">
                <v-icon>$delete</v-icon>
              </v-btn>
            </div>
          </v-list-item-action>
        </v-list-item>
        <v-divider
          v-if="index < installed.length - 1"
          :key="`divider-${index}`"
        />
      </template>
    </v-list>

    <v-dialog v-model="showUninstallDialog" width="500" persistent>
      <v-card :loading="uninstalling">
        <v-card-title class="dark-title white--text" primary-title>
          <v-icon left color="primary">$delete</v-icon>
          Uninstall
        </v-card-title>

        <v-card-text class="pt-5">
          Are you sure you want to completely remove SDK
          <strong>{{ uninstallSdkVersion }}</strong>
          ?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn text @click="showUninstallDialog = false">
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="uninstall(uninstallSdkVersion)">
            Uninstall
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </dashboard-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    showUninstallDialog: false,
    uninstallSdkVersion: null
  }),
  computed: {
    ...mapState('sdk', ['installed', 'uninstalling'])
  },
  methods: {
    confirmUninstall(sdkVersion) {
      this.uninstallSdkVersion = sdkVersion
      this.showUninstallDialog = true
    },
    async uninstall(sdkVersion) {
      await this.$store.dispatch('sdk/uninstall', sdkVersion)
      this.showUninstallDialog = false
      this.uninstallSdkVersion = null
    }
  }
}
</script>
