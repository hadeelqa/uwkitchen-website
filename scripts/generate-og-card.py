"""
Generate the Open Graph / social share card used by index.html and
maintenance-request.html. Renders a branded 1200x630 JPG with the
United White Kitchens logo centered on the brand purple background.

Run:
    python scripts/generate-og-card.py

Output:
    public/images/og-card.jpg
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "public" / "images" / "Logo-white.png"
OUT_PATH = ROOT / "public" / "images" / "og-card.jpg"

W, H = 1200, 630
PURPLE = (70, 22, 66)          # --purple   #461642
PURPLE_DARK = (46, 14, 43)     # --purple-dark  #2e0e2b
GOLD = (212, 136, 74)          # --gold     #d4884a


def radial_gradient_background() -> Image.Image:
    """Dark purple background with a soft radial highlight at the center."""
    bg = Image.new("RGB", (W, H), PURPLE_DARK)
    overlay = Image.new("RGB", (W, H), PURPLE)
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    cx, cy = W // 2, H // 2
    for r in range(max(W, H), 0, -8):
        alpha = int(180 * (1 - r / max(W, H)))
        md.ellipse((cx - r, cy - r, cx + r, cy + r), fill=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=60))
    bg.paste(overlay, (0, 0), mask)
    return bg


def add_gold_frame(img: Image.Image) -> None:
    """Thin gold border inset from the edge for a premium feel."""
    d = ImageDraw.Draw(img)
    pad = 28
    # Top and bottom accent lines (not a full rect, feels lighter)
    d.rectangle((pad, pad, W - pad, pad + 2), fill=GOLD)
    d.rectangle((pad, H - pad - 2, W - pad, H - pad), fill=GOLD)


def paste_logo_centered(img: Image.Image) -> None:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    # Scale to ~520px wide while preserving aspect
    target_w = 520
    scale = target_w / logo.width
    target_h = int(logo.height * scale)
    logo = logo.resize((target_w, target_h), Image.LANCZOS)

    x = (W - target_w) // 2
    y = (H - target_h) // 2 - 10  # slight optical centering
    img.paste(logo, (x, y), logo)


def main() -> None:
    img = radial_gradient_background()
    add_gold_frame(img)
    paste_logo_centered(img)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_PATH, "JPEG", quality=90, optimize=True, progressive=True)
    size_kb = OUT_PATH.stat().st_size / 1024
    print(f"wrote {OUT_PATH} ({W}x{H}, {size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
