#!/usr/bin/env node
/**
 * Gera WebP otimizados + variantes responsivas (480/768/1200) e logo leve.
 * Requer Python 3 + Pillow.
 * Uso: node scripts/optimize-images.mjs
 */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const py = `
from PIL import Image
import os

base = ${JSON.stringify(root)}

def save_webp(img, path, quality=82, lossless=False):
    if img.mode not in ("RGBA", "RGB"):
        img = img.convert("RGBA")
    options = {"method": 6}
    if lossless:
        options["lossless"] = True
    else:
        options["quality"] = quality
    img.save(path, "WEBP", **options)

def resize_width(img, target_w):
    if img.width <= target_w:
        return img.copy()
    ratio = target_w / img.width
    target_h = max(1, round(img.height * ratio))
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

for stem in ("imagem_topo", "imagem_passeio"):
    src = os.path.join(base, f"{stem}.webp")
    if not os.path.exists(src):
        src = os.path.join(base, f"{stem}.png")
    img = Image.open(src)
    img = img.convert("RGBA" if img.mode in ("RGBA", "P") else "RGB")
    for w in (480, 768, 1200):
        out = os.path.join(base, f"{stem}-{w}.webp")
        save_webp(resize_width(img, w), out, quality=80 if w <= 768 else 82)
        print("OK", os.path.basename(out))

logo = Image.open(os.path.join(base, "logoboramiga.png")).convert("RGBA")
save_webp(resize_width(logo, 360), os.path.join(base, "logoboramiga-logo.webp"), quality=88)
save_webp(resize_width(logo, 720), os.path.join(base, "logoboramiga.webp"), quality=85)
print("OK logoboramiga-logo.webp")
print("OK logoboramiga.webp")

support_src = os.path.join(base, "Apoio.png")
if not os.path.exists(support_src):
    raise FileNotFoundError("Apoio.png não encontrado")

support = Image.open(support_src).convert("RGB")
for w in (480, 768, 1024):
    out = os.path.join(base, f"apoio-institucional-v2-{w}.webp")
    save_webp(resize_width(support, w), out, lossless=True)
    print("OK", os.path.basename(out))
`;

const result = spawnSync("python3", ["-c", py], { stdio: "inherit" });
process.exit(result.status ?? 1);
