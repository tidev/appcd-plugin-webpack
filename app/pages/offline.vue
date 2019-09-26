<template>
  <v-container fill-height>
    <v-row justify="center">
      <v-col cols="6" xs="12">
        <v-alert color="error" dark icon="mdi-alert" border="left" prominent>
          <h3 class="headline">Offline</h3>
          <div>
            The Daemon appears to be offline. Make sure it is started.
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  head: () => ({
    title: 'Daemon is offline'
  }),
  mounted() {
    this.pingInterval = setInterval(async () => {
      try {
        const result = await this.$axios.get('/appcd/status', {
          progress: false
        })
        console.log(result)
        let redirectTo = this.$route.query.redirect || '/'
        if (redirectTo === this.$route.path) {
          redirectTo = '/'
        }
        window.location = redirectTo
      } catch (e) {}
    }, 2000)
  },
  destroyed() {
    clearInterval(this.pingInterval)
  }
}
</script>
