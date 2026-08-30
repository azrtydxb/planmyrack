## Rebuild the native binaries now?

The four UI changes (wordmark splash, measured cable ends, configurable generic gear,
real faceplates) are on `main`, but the last EAS iOS/Android builds predate them.

- Rebuild both platforms now and re-verify the splash and faceplates on the iOS simulator with idb.
- Rebuild iOS only — the splash and faceplate work is what needs eyes, and the simulator is here.
- **Decided (2026-08-30): not yet** — the binaries stay stale; the rebuild batches with the next round of changes.
