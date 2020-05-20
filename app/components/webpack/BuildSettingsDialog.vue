<template>
  <v-dialog v-model="open" width="500">
    <template v-slot:activator="{ on }">
      <v-btn class="ml-2" v-on="on">
        Settings
        <v-icon right>$settings</v-icon>
      </v-btn>
    </template>

    <v-card :loading="saving">
      <v-card-title class="dark-title white--text" primary-title>
        <v-icon left color="primary">$settings</v-icon>
        Build Settings
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-container>
            <v-col cols="12">
              <v-select
                v-model="fields.platform"
                label="Platform"
                :items="platforms"
                item-value="value"
                item-text="text"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="fields.deployType"
                label="Deploy Type"
                :items="deployTypes"
                item-value="value"
                item-text="text"
              ></v-select>
            </v-col>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn text @click="open = false">
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="saveOptions()">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    open: false,
    saving: false,
    fields: {
      platform: '',
      deployType: ''
    },
    platforms: [
      { text: 'Android', value: 'android' },
      { text: 'iOS', value: 'ios' }
    ],
    deployTypes: [
      { text: 'Development', value: 'development' },
      { text: 'Test', value: 'test' },
      { text: 'Production', value: 'production' }
    ]
  }),
  computed: {
    ...mapState('webpack', {
      job: 'currentJob'
    })
  },
  watch: {
    open(isOpen) {
      if (!isOpen) {
        return
      }

      this.fields.platform = this.job.platform
      this.fields.deployType = this.job.deployType
    }
  },
  methods: {
    async saveOptions() {
      this.saving = true
      await this.$store.dispatch('webpack/startJob', {
        identifier: this.job.id,
        build: {
          platform: this.fields.platform,
          deployType: this.fields.deployType
        }
      })
      this.$store.commit('webpack/updateJob', this.fields)
      this.open = false
      this.saving = false
    }
  }
}
</script>
