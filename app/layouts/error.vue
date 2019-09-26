<template>
  <v-container fill-height>
    <v-row justify="center">
      <v-col cols="6" xs="12">
        <dashboard-card>
          <v-card-title>
            {{ message }}
          </v-card-title>
          <v-card-text>
            <NuxtLink to="/">
              Home page
            </NuxtLink>
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
