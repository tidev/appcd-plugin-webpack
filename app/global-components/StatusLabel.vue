<template>
  <span class="d-flex align-center">
    <v-icon color="#53b7e6" size="18" class="mr-1">mdi-webpack</v-icon>
    {{ title }}
  </span>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      required: true
    }
  },
  computed: {
    title() {
      if (this.status === 'ready') {
        return 'Idle'
      } else {
        return this.status.charAt(0).toUpperCase() + this.status.slice(1)
      }
    }
  }
}
</script>
