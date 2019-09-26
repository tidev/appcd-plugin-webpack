import { SubscriptionClient } from '@/utils/subscription'

export default async store => {
  if (process.server) {
    return
  }

  const client = new SubscriptionClient()
  client.on('connect', () => {
    // @fixme without timeout vuex ignores this mutation
    setTimeout(() => {
      store.commit('webpack/connected', true)
    }, 50)
  })
  client.on('error', () => {
    console.log('websocket error')
    store.commit('webpack/connected', false)
  })
  client.on('close', () => {
    console.log('websocket close')
    store.commit('webpack/connected', false)
  })
  try {
    const subscription = await client.subscribe('/webpack/latest/status')
    subscription.on('message', data => {
      console.log('general status update')
      console.log(data)
      const job = data.job
      store.commit('webpack/addOrUpdateJob', job)
    })

    window.addEventListener('beforeunload', () => {
      console.log('beforeunload unsubscribe')
      subscription.unsubscribe()
    })
  } catch (e) {
    // TODO: print error message about failed subscription
    console.log(e)
  }
}
