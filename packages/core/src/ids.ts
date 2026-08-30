// Hermes exposes neither crypto.randomUUID nor crypto.getRandomValues by default, and these
// ids are local document keys rather than security tokens — so they are minted without crypto.
// The counter is what stops two ids minted in the same millisecond from colliding.
let counter = 0

export function newId(): string {
  counter = (counter + 1) % 0xffffff
  const random = Math.floor(Math.random() * 0xffffffff).toString(36)
  return `${counter.toString(36)}${random}${Math.floor(Math.random() * 0xffffffff).toString(36)}`.slice(
    0,
    16,
  )
}
