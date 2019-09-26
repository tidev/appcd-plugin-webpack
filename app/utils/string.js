export function capitalizeFirstLetter(value) {
  if (!value || value.length < 2) {
    return value
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}
