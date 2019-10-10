import Vue from 'vue'

function withBase(path) {
  return `http://localhost:3000/webpack/latest/${path}`
}

export const state = () => ({
  jobs: [],
  currentJob: {},
  stats: null,
  connected: false
})

export const getters = {
  activeBuilds: state => {
    return state.jobs.filter(job => {
      return job.state === 'building'
    })
  },
  idleBuilds: state => {
    return state.jobs.filter(job => {
      return job.state === 'ready'
    })
  },
  erroredBuilds: state => {
    return state.jobs.filter(job => {
      return job.state === 'error'
    })
  },
  stats: state => state.stats,
  errors: (state, getters) => (getters.stats && getters.stats.errors) || [],
  warnings: (state, getters) => (getters.stats && getters.stats.warnings) || [],
  assets: (state, getters) => (getters.stats && getters.stats.assets) || [],
  assetsSize: (state, getters) =>
    (getters.stats && getters.stats.assetsSize) || 0,
  modulesSize: (state, getters) =>
    (getters.stats && getters.stats.modulesSize) || 0,
  depModules: (state, getters) =>
    (getters.stats && getters.stats.depModules) || [],
  depModulesSize: (state, getters) =>
    (getters.stats && getters.stats.depModulesSize) || 0
}

export const mutations = {
  connected(state, isConnected) {
    state.connected = isConnected
  },
  setJobs(state, jobs) {
    Vue.set(state, 'jobs', [...jobs])
  },
  updateJob(state, update) {
    state.currentJob = Object.assign({}, state.currentJob, update)
  },
  addOrUpdateJob(state, job) {
    const existingJobIndex = state.jobs.findIndex(j => j.id === job.id)
    if (existingJobIndex) {
      const existingJob = state.jobs[existingJobIndex]
      const updatedJob = Object.assign({}, existingJob, job)
      Vue.set(state.jobs, existingJobIndex, updatedJob)
    } else {
      state.jobs.push(job)
    }
  },
  setCurrentJob(state, job) {
    Vue.set(state, 'currentJob', job)
  },
  addHistory(state, historyEntry) {
    const history = state.currentJob.history
    history.unshift(historyEntry)
    if (history.length > 10) {
      history.pop()
    }
  },
  stats(state, stats) {
    state.stats = stats
  }
}

export const actions = {
  async fetchJobs(context) {
    const { data } = await this.$axios.get(withBase('list'))
    context.commit('setJobs', data)
  },
  async fetchJob(context, id) {
    const { data } = await this.$axios.get(withBase(`status/${id}`))
    const stats = data.stats
    delete data.stats
    context.commit('setCurrentJob', data)
    context.commit('stats', stats)
  },
  async startJob(context, id) {
    await this.$axios.get(withBase(`start/${id}`))
    context.commit('updateJob', {
      progress: {
        progress: 0
      }
    })
  },
  async stopJob(context, id) {
    try {
      await this.$axios.get(withBase(`stop/${id}`))
      context.commit('updateJob', { state: 'stopped' })
    } catch (e) {
      context.commit('updateJob', { state: 'error' })
    }
  }
}
