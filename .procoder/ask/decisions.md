## Confirm Android landscape on a specific device size?

Android landscape (typically 892x412) sits in the same 600–1180pt band as the iPhone
landscape sizes already checked (852x393, 932x430), so it takes the identical layout
path: rail, canvas, side panel.

- Take the band as covered — the iPhone landscape screenshots already exercise it.
- Shoot a named Android size as well (892x412, or another the user names).
- **Decided (2026-08-31): run it on a real Android emulator** — then superseded by the disk-space
  decision below, which skipped it.

## The disk has 11 GiB free — how should the Android emulator run proceed?

There is no Android SDK on this machine. A working emulator needs the command-line
tools, platform-tools, a system image, the emulator itself, plus a Gradle build of the
app: roughly 8–12 GiB. The volume reports 11 GiB free, so the install could fill it.

- Free space first, then install the SDK and run the emulator.
- Install anyway and watch the space as it goes.
- **Decided (2026-08-31): skip the emulator** — the disk cannot spare the space, and the
  layout path is already verified at Android landscape sizes in the browser.
- Build with EAS in the cloud and install the APK on a physical Android device.
