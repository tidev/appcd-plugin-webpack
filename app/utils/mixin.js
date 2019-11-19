export default {
  methods: {
    getIcon(job) {
      switch (job.state) {
        case 'ready':
          return '$check'
        case 'building':
          return '$flask'
        case 'started':
        case 'stopped':
          return '$webpack'
        case 'error':
          return '$exclamation'
      }
    },
    getIconClass(job) {
      switch (job.state) {
        case 'ready':
          return 'primary'
        case 'building':
          return 'warning'
        case 'started':
        case 'stopped':
          return 'grey'
        case 'error':
          return 'error'
      }
    }
  }
}
