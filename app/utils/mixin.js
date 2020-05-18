export default {
  methods: {
    getIcon(job) {
      switch (job.state) {
        case 'ready':
          return '$check'
        case 'building':
          return '$flask'
        case 'started':
          return '$webpack'
        case 'stopped':
          return '$stop'
        case 'error':
          return '$exclamation'
      }
    },
    getIconClass(job) {
      switch (job.state) {
        case 'ready':
        case 'building':
          return 'primary'
        case 'started':
        case 'stopped':
          return 'grey lighten-1'
        case 'error':
          return 'error'
      }
    }
  }
}
