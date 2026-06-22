from PIL import Image, ImageOps
from pathlib import Path

public = Path("public")
src = public / "Read-Nest.png"

img = Image.open(src).convert("RGBA")
w, h = img.size

# Crop center area so character becomes larger in favicon
# Full body favicon is too small, so this zooms toward upper/middle character area.
left = int(w * 0.22)
top = int(h * 0.10)
right = int(w * 0.78)
bottom = int(h * 0.78)

crop = img.crop((left, top, right, bottom))

# Make square
crop = ImageOps.fit(crop, (512, 512), method=Image.Resampling.LANCZOS, centering=(0.5, 0.45))

# Add slight padding but keep it large
canvas = Image.new("RGBA", (512, 512), (24, 18, 34, 255))
crop = ImageOps.contain(crop, (500, 500), method=Image.Resampling.LANCZOS)
x = (512 - crop.width) // 2
y = (512 - crop.height) // 2
canvas.alpha_composite(crop, (x, y))

# Export favicon sizes
sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}

for name, size in sizes.items():
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(public / name)

# ico file with multiple sizes
canvas.save(public / "favicon.ico", sizes=[(16,16), (32,32), (48,48)])

print("Zoomed ReadNest favicon generated successfully.")
