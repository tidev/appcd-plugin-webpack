export function normalizeReleases(data) {
  return Object.keys(data).reduce((results, name) => {
    const meta = data[name]
    results.push(meta)
    return results
  }, [])
}
