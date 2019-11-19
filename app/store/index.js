export const state = () => ({
  connected: false
})

export const mutations = {
  connected(state, isConnected) {
    state.connected = isConnected
  }
}
