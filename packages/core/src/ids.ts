// Hermes exposes neither crypto.randomUUID nor crypto.getRandomValues by default, so this cannot
// depend on them. Where they do exist — a browser, node, a newer Hermes — they are used, because
// ids are minted on every client and the server is a shared surface: two devices creating gear at
// the same moment should not be able to agree on an id by accident.
let counter = 0

const uuid = (): string | null => {
  const source = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  return typeof source?.randomUUID === 'function' ? source.randomUUID() : null
}

export function newId(): string {
  const strong = uuid()
  if (strong) return strong.replace(/-/g, '').slice(0, 16)

  // The counter is what stops two ids minted in the same millisecond from colliding.
  counter = (counter + 1) % 0xffffff
  const random = Math.floor(Math.random() * 0xffffffff).toString(36)
  return `${counter.toString(36)}${random}${Math.floor(Math.random() * 0xffffffff).toString(36)}`.slice(
    0,
    16,
  )
}
