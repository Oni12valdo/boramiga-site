#!/usr/bin/env node
/**
 * Gera versões WebP das imagens PNG do projeto (fallback PNG permanece no HTML).
 * Requer: pip install pillow  OU  ImageMagick (convert).
 * Uso: node scripts/optimize-images.mjs
 */
import { execSync, spawnSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["imagem_topo.png", "imagem_passeio.png", "logoboramiga.png", "Apio.png"];

function viaPython(src, dest) {
  const code = `
from PIL import Image
img = Image.open(${JSON.stringify(src)})
if img.mode in ("RGBA", "P"):
    img = img.convert("RGBA")
else:
    img = img.convert("RGB")
img.save(${JSON.stringify(dest)}, "WEBP", quality=82, method=6)
`;
  spawnSync("python3", ["-c", code], { stdio: "inherit" });
}

for (const name of files) {
  const src = join(root, name);
  if (!existsSync(src)) continue;
  const dest = join(root, basename(name, extname(name)) + ".webp");
  try {
    viaPython(src, dest);
    console.log("OK:", name, "->", basename(dest));
  } catch (e) {
    console.warn("Falha em", name, e.message);
  }
}
