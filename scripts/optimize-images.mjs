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

def save_webp(img, path, quality=82):
    if img.mode not in ("RGBA", "RGB"):
        img = img.convert("RGBA")
    img.save(path, "WEBP", quality=quality, method=6)

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

for name in ("Apio.webp",):
    src = os.path.join(base, name)
    if os.path.exists(src):
        img = Image.open(src).convert("RGBA")
        save_webp(img, os.path.join(base, "Apio.webp"), quality=82)
        for w in (480, 768):
            save_webp(resize_width(img, w), os.path.join(base, f"Apio-{w}.webp"), quality=82)
        print("OK Apio.webp + Apio-480.webp + Apio-768.webp")
`;

const result = spawnSync("python3", ["-c", py], { stdio: "inherit" });
process.exit(result.status ?? 1);
