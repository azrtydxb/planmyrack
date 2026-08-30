#!/usr/bin/env python3
"""Derive platform icons from assets/brand/, applying the store rules the sources do not satisfy.

- iOS marketing icon must be opaque and square-cornered: the store rejects alpha, and both
  platforms apply their own mask, so a baked-in rounded corner would be rounded twice.
- The Android adaptive foreground is cropped by the launcher mask, so the artwork is padded into
  the central safe zone rather than filling the frame.
- A favicon is read at 16-32px: a downscale of the full illustration is mud, so it is cropped to
  the rack itself and sharpened.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "assets" / "brand"
OUT = ROOT / "apps" / "app" / "assets"
BACKGROUND = (11, 16, 32)  # theme.bg — what the artwork was drawn to sit on


def opaque(image: Image.Image) -> Image.Image:
    flat = Image.new("RGB", image.size, BACKGROUND)
    flat.paste(image, mask=image.split()[3] if image.mode == "RGBA" else None)
    return flat


def trim_to_content(image: Image.Image) -> Image.Image:
    box = image.split()[3].getbbox() if image.mode == "RGBA" else image.getbbox()
    return image.crop(box) if box else image


def main() -> None:
    icon_src = Image.open(BRAND / "app-icon.png").convert("RGBA")
    wordmark = Image.open(BRAND / "wordmark.png").convert("RGBA")

    # iOS / store icon: opaque, square, exactly 1024.
    icon = opaque(trim_to_content(icon_src).resize((1024, 1024), Image.LANCZOS))
    icon.save(OUT / "icon.png")

    # Android adaptive foreground: subject inside the central 66%, transparent elsewhere.
    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    inner = trim_to_content(icon_src).resize((640, 640), Image.LANCZOS)
    fg.paste(inner, ((1024 - 640) // 2, (1024 - 640) // 2), inner)
    fg.save(OUT / "android-icon-foreground.png")
    Image.new("RGB", (1024, 1024), BACKGROUND).save(OUT / "android-icon-background.png")

    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mono.paste(
        inner.convert("LA").convert("RGBA"),
        ((1024 - 640) // 2, (1024 - 640) // 2),
        inner,
    )
    mono.save(OUT / "android-icon-monochrome.png")

    # Favicon: the rack alone, small enough to read at 32px.
    trimmed = trim_to_content(icon_src)
    side = min(trimmed.size)
    left = (trimmed.width - side) // 2
    top = (trimmed.height - side) // 2
    favicon = opaque(
        trimmed.crop((left, top, left + side, top + side)).resize(
            (64, 64), Image.LANCZOS
        )
    )
    favicon.save(OUT / "favicon.png")

    # Splash: the wordmark on the app background.
    splash = opaque(wordmark.resize((1536, 1024), Image.LANCZOS))
    splash.save(OUT / "splash-icon.png")

    for name in (
        "icon.png",
        "android-icon-foreground.png",
        "favicon.png",
        "splash-icon.png",
    ):
        made = Image.open(OUT / name)
        print(f"{name}: {made.size[0]}x{made.size[1]} {made.mode}")


if __name__ == "__main__":
    main()
