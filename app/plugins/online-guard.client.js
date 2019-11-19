let isInitialRoute = true

export default function({ app, store }) {
  app.router.beforeEach((to, from, next) => {
    if (isInitialRoute) {
      isInitialRoute = false
      return next()
    }

    if (!store.state.connected) {
      return next(false)
    }

    next()
  })
}
