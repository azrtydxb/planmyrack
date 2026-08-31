/** A device cannot go where it was asked to go — the caller refuses the drop rather than overlapping. */
export class PlacementError extends Error {
  readonly code:
    | 'no-room'
    | 'no-such-device'
    | 'no-such-rack'
    | 'no-such-port'
    | 'would-strand'
    | 'no-such-slot'
    | 'slot-taken'

  constructor(code: PlacementError['code'], message: string) {
    super(message)
    this.name = 'PlacementError'
    this.code = code
  }
}

/** A port already carries a cable of that kind; one cable per port is the rule. */
export class PortBusyError extends Error {
  readonly code = 'port-busy'
  readonly occupiedBy: { id: string }

  constructor(message: string, occupiedBy: { id: string }) {
    super(message)
    this.name = 'PortBusyError'
    this.occupiedBy = occupiedBy
  }
}

/** A layout document could not be read. `reason` names the offending part. */
export class ImportError extends Error {
  readonly reason: string

  constructor(reason: string) {
    super(`That file isn't a layout this version can open: ${reason}`)
    this.name = 'ImportError'
    this.reason = reason
  }
}
