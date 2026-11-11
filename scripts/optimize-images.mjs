#!/usr/bin/env node
/**
 * Gera WebP otimizados + variantes responsivas e logo leve.
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

image_sets = (
    {
        "src": "imagem_topo.webp",
        "output_stem": "imagem_topo",
        "widths": (480, 768, 1200),
    },
    {
        # A imagem oficial do passeio e a unica fonte autorizada destes derivados.
        "src": "imagem_passeio.png",
        "output_stem": "imagem-passeio-v2",
        "widths": (480, 768, 1200, 2048),
    },
)

for image_set in image_sets:
    src = os.path.join(base, image_set["src"])
    if not os.path.exists(src):
        raise FileNotFoundError(f"{image_set['src']} não encontrado")
    img = Image.open(src)
    img = img.convert("RGBA" if img.mode in ("RGBA", "P") else "RGB")
    for w in image_set["widths"]:
        out = os.path.join(base, f"{image_set['output_stem']}-{w}.webp")
        quality = 80 if w <= 768 else 82 if w <= 1200 else 84
        save_webp(resize_width(img, w), out, quality=quality)
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
