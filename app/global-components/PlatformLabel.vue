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
        case 'iphone':
          return 'iOS'
        default:
          return 'Unknown'
      }
    },
    icon() {
      switch (this.platform) {
        case 'android':
          return '$android'
        case 'ios':
        case 'iphone':
          return '$apple'
        default:
          return '$cellphone'
      }
    },
    iconColor() {
      switch (this.platform) {
        case 'android':
          return '#78C257'
        case 'ios':
        case 'iphone':
          return '#A3AAAE'
        default:
          return null
      }
    }
  }
}
</script>
