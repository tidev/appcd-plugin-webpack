export default async function({ $axios, from, redirect, route, store }) {
  if (process.client) {
    if (!store.state.webpack.connected) {
      redirect(from)
    }
  } else {
    try {
      await $axios.get('/appcd/status')
      if (route.path === '/offline') {
        redirect(route.query.redirect || '/')
      }
    } catch (e) {
      const redirectTo = route.query.redirect || route.path
      redirect('/offline', { redirect: redirectTo })
    }
  }
}
