#!/usr/bin/env node
/**
 * Compress and resize photos for web – keeps quality high, slashes file size.
 *
 * Usage:
 *   node scripts/compress-photos.js "photos-to-upload/MYOS Mexico"
 *
 * Output: "photos-to-upload/MYOS Mexico-compressed/"
 *
 * - Resizes to max 1600px (longest edge) – plenty for mobile/desktop
 * - JPEG quality 85 – sharp, small files (~80–150KB typical)
 * - Skips RAW (CR2, ARW, etc.) – export those to JPEG first
 *
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MAX_SIZE = 1600;
const JPEG_QUALITY = 85;
const EXT = /\.(jpg|jpeg|png|webp|gif|tiff?)$/i;

const folderPath = process.argv[2];
if (!folderPath || !fs.existsSync(folderPath)) {
  console.error('Usage: node scripts/compress-photos.js <folder-path>');
  console.error('Example: node scripts/compress-photos.js "photos-to-upload/MYOS Mexico"');
  process.exit(1);
}

const outDir = path.resolve(path.dirname(folderPath), path.basename(folderPath) + '-compressed');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(folderPath).filter((f) => EXT.test(f));
const sorted = files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

console.log(`Compressing ${sorted.length} images → ${outDir}`);
console.log(`  Max ${MAX_SIZE}px, JPEG quality ${JPEG_QUALITY}\n`);

async function compress() {
  let totalIn = 0;
  let totalOut = 0;

  for (let i = 0; i < sorted.length; i++) {
    const file = sorted[i];
    const ext = path.extname(file).toLowerCase();
    const inPath = path.join(folderPath, file);
    const outName = `${String(i + 1).padStart(3, '0')}.jpg`;
    const outPath = path.join(outDir, outName);

    try {
      const stat = fs.statSync(inPath);
      totalIn += stat.size;

      await sharp(inPath)
        .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(outPath);

      const outStat = fs.statSync(outPath);
      totalOut += outStat.size;
      const pct = Math.round((1 - outStat.size / stat.size) * 100);
      console.log(`  ${i + 1}/${sorted.length}: ${file} → ${outName} (${pct}% smaller)`);
    } catch (err) {
      console.error(`  ${file}: ${err.message}`);
    }
  }

  const inMB = (totalIn / 1024 / 1024).toFixed(1);
  const outMB = (totalOut / 1024 / 1024).toFixed(1);
  const saved = Math.round((1 - totalOut / totalIn) * 100);
  console.log(`\nDone! ${inMB}MB → ${outMB}MB (${saved}% smaller)`);
  console.log(`Upload from: ${outDir}`);
}

compress().catch((err) => {
  console.error(err);
  process.exit(1);
});
