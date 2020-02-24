export function base(plugin, version = 'latest') {
  return path => `/appcd/${plugin}/${version}/${path}`
}
