<template>
  <span class="d-flex align-center">
    <v-icon :color="iconColor" size="18" class="mr-1">{{ icon }}</v-icon>
    {{ title }}
  </span>
</template>

<script>
export default {
  props: {
    platform: {
      type: String,
      default: null
    }
  },
  computed: {
    title() {
      switch (this.platform) {
        case 'android':
          return 'Android'
        case 'ios':
          return 'iOS'
        default:
          return 'Unknown'
      }
    },
    icon() {
      switch (this.platform) {
        case 'android':
          return 'mdi-android'
        case 'ios':
          return 'mdi-apple'
        default:
          return 'mdi-cellphone'
      }
    },
    iconColor() {
      switch (this.platform) {
        case 'android':
          return '#78C257'
        case 'ios':
          return '#A3AAAE'
        default:
          return null
      }
    }
  }
}
</script>
