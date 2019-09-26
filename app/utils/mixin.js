export default {
  methods: {
    getIcon(job) {
      switch (job.state) {
        case 'ready':
          return 'mdi-check'
        case 'building':
          return 'mdi-webpack'
        case 'started':
        case 'stopped':
          return 'mdi-webpack'
        case 'error':
          return 'mdi-alert'
      }
    },
    getIconClass(job) {
      switch (job.state) {
        case 'ready':
          return 'primary white--text'
        case 'building':
          return 'info white--text'
        case 'started':
        case 'stopped':
          return 'grey white--text'
        case 'error':
          return 'red white--text'
      }
    }
  }
}
