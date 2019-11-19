<template>
  <v-container fill-height>
    <v-row justify="center">
      <v-col cols="6" xs="12">
        <dashboard-card>
          <v-card-text class="text-center">
            <v-icon size="64" color="grey lighten-2">
              mdi-skull-crossbones
            </v-icon>
            <h2 class="py-6">{{ message }}</h2>
            <v-btn color="primary" to="/">
              Go home
            </v-btn>
          </v-card-text>
        </dashboard-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },
  computed: {
    message() {
      if (this.error.message) {
        return this.error.message
      }

      return this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    }
  }
}
</script>
