#!/usr/bin/env node
/**
 * Minifica style.css -> style.min.css
 * Uso: node scripts/minify-css.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = join(root, "style.css");
const output = join(root, "style.min.css");

let css = readFileSync(input, "utf8");
css = css.replace(/\/\*[\s\S]*?\*\//g, "");
css = css.replace(/\s+/g, " ");
css = css.replace(/\s*([{}:;,>+~])\s*/g, "$1");
css = css.trim();

writeFileSync(output, css);
console.log(`Minificado: ${input} -> ${output} (${css.length} bytes)`);
