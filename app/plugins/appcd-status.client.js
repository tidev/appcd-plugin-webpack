import { client } from '@/utils/subscription'

export default function({ store }) {
  if (client.connected) {
    store.commit('connected', true)
  }
  client.on('connect', () => {
    // @fixme without timeout vuex ignores this mutation
    setTimeout(() => {
      store.commit('connected', true)
    }, 50)
  })
  client.on('error', () => {
    store.commit('connected', false)
  })
  client.on('close', () => {
    store.commit('connected', false)
  })
  client
    .subscribe('/appcd/status/version')
    .then(subscription => {
      subscription.on('message', data => {
        // console.log(data)
      })

      window.addEventListener('beforeunload', () => {
        subscription.unsubscribe()
      })
    })
    .catch(e => {
      console.log(e)
    })
}
