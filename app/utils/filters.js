export function size(size, unit = '', precision = 1) {
  const b = {
    label: '',
    value: 1
  }
  const kb = {
    label: 'k',
    value: 1024
  }
  const mb = {
    label: 'M',
    value: 1024 * 1024
  }
  let denominator

  if (size >= mb.value) {
    denominator = mb
  } else if (size >= kb.value) {
    denominator = kb
  } else if (size === 0) {
    denominator = kb
  } else {
    denominator = b
  }
  return (
    (size / denominator.value).toFixed(precision) + denominator.label + unit
  )
}
