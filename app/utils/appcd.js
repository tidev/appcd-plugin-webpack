export function base(plugin, version = 'latest') {
  return path => `http://localhost:3000/appcd/${plugin}/${version}/${path}`
}
