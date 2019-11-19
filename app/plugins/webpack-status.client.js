import { client } from '@/utils/subscription'

export default function({ store }) {
  client
    .subscribe('/webpack/1.0.0/status')
    .then(subscription => {
      subscription.on('message', data => {
        console.log(data)
        const job = data.job
        store.commit('webpack/addOrUpdateJob', job)
      })

      window.addEventListener('beforeunload', () => {
        subscription.unsubscribe()
      })
    })
    .catch(e => {
      console.log(e)
    })
}
