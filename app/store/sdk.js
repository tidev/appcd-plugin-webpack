import Vue from 'vue'

import { base } from '@/utils/appcd'
import { normalizeReleases } from '@/utils/sdk'

const withBase = base('titanium', '1.6.0')

export const state = () => ({
  installed: [],
  installing: null,
  lastInstall: {},
  uninstalling: false,
  releases: [],
  latestRelease: null
})

export const getters = {
  updateAvailable: state => {
    const installedIndex = state.installed.findIndex(
      sdkInfo => sdkInfo.name === state.latestRelease
    )
    return installedIndex === -1
  }
}

export const mutations = {
  setInstalled(state, installed) {
    Vue.set(state, 'installed', installed)
  },
  setReleases(state, releases) {
    Vue.set(state, 'releases', releases)
  },
  setLatestRelease(state, releaseName) {
    state.latestRelease = releaseName
  },
  installing(state, installing) {
    state.installing = installing
  },
  lastInstall(state, payload) {
    state.lastInstall = payload
  },
  uninstalling(state, uninstalling) {
    state.uninstalling = uninstalling
  }
}

export const actions = {
  async fetchInstalled(context) {
    const { data } = await this.$axios.get(withBase('sdk/list'))
    context.commit('setInstalled', data.reverse())
  },
  async fetchReleases(context) {
    const { data } = await this.$axios.get(withBase('sdk/releases'))
    const latest = data.latest
    delete data.latest
    const releases = normalizeReleases(data)
    releases.sort((a, b) => b.name.localeCompare(a.name))
    context.commit('setReleases', releases)
    context.commit('setLatestRelease', latest.name)
  },
  async install(context, options) {
    const { sdkVersion, overwrite } = options
    context.commit('installing', sdkVersion)
    const response = await this.$axios.post(
      withBase(`sdk/install/${sdkVersion}`),
      {
        data: {
          overwrite
        }
      }
    )
    await context.dispatch('fetchInstalled')
    context.commit('installing', null)
    context.commit('lastInstall', {
      sdkVersion,
      success: response.status === 200,
      message: response.data
    })
  },
  async uninstall(context, sdkVersion) {
    context.commit('uninstalling', true)
    await this.$axios.post(withBase(`sdk/uninstall/${sdkVersion}`))
    await context.dispatch('fetchInstalled')
    context.commit('uninstalling', false)
  }
}
