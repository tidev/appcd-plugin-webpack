<template>
  <span class="d-flex align-center">
    <v-icon :color="iconColor" size="18" class="mr-1">{{ icon }}</v-icon>
    {{ title }}
  </span>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: null
    }
  },
  computed: {
    title() {
      switch (this.type) {
        case 'alloy':
          return 'Alloy'
        case 'angular':
          return 'Angular'
        case 'classic':
          return 'Classic'
        case 'vue':
          return 'Vue.js'
        default:
          return 'Unknown'
      }
    },
    icon() {
      switch (this.type) {
        case 'angular':
          return '$angular'
        case 'alloy':
        case 'classic':
          return '$titanium'
        case 'vue':
          return '$vuejs'
        default:
          return '$javascript'
      }
    },
    iconColor() {
      switch (this.type) {
        case 'angular':
          return '#dc222f'
        case 'alloy':
        case 'classic':
          return '#D22630'
        case 'vue':
          return '#4fc08d'
        default:
          return '#d6d6d6'
      }
    }
  }
}
</script>
