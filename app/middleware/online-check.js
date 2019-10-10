export default async function({ $axios, from, redirect, route, store }) {
  if (process.client) {
    return
  }

  try {
    await $axios.get('/appcd/status')
    store.commit('webpack/connected', true)
  } catch (e) {
    const redirectTo = route.query.redirect || route.path
    redirect('/offline', { redirect: redirectTo })
  }
}
