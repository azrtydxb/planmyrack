# Brand sources

Original artwork, kept at full resolution. Platform assets are *derived* from these into
`apps/app/assets/` by Task 20 — never edit the derived copies by hand.

| File                 | Size      | Role                                        |
| -------------------- | --------- | ------------------------------------------- |
| `app-icon.png`       | 1254x1254 | Source for the iOS/Android app icon          |
| `favicon-source.png` | 1254x1254 | Source for the web favicon                   |
| `wordmark.png`       | 1536x1024 | Source for the splash screen and marketing   |

Known constraints these sources do not yet satisfy, handled when deriving:

- **iOS marketing icon must be opaque.** `app-icon.png` has an alpha channel; the 1024x1024
  icon is flattened onto an opaque background before submission.
- **The rounded square is baked in.** iOS and Android both apply their own mask, so the derived
  icon is squared off first, or the artwork gets double-rounded corners.
- **Android adaptive icons need a safe zone.** The foreground layer must keep its subject
  inside the central 66% or the launcher mask crops it; the artwork currently fills the frame.
- **A favicon is 16-32px.** The full illustration is unreadable at that size; the derived
  favicon uses a simplified mark rather than a downscale of `favicon-source.png`.
- **The wordmark is low contrast.** Legible on the dark splash, not on a light background.
