#!/usr/bin/env node
/**
 * Upload photos to Firebase Storage for a place (e.g. mexico).
 *
 * Usage (explicit place):
 *   node scripts/upload-photos.js mexico "/path/to/folder"
 *
 * Usage (MYOS [Place] folder – place derived from folder name):
 *   node scripts/upload-photos.js "/path/to/MYOS Mexico"
 *   Drop folders in photos-to-upload/ and run:
 *   node scripts/upload-photos.js "photos-to-upload/MYOS Mexico"
 *
 * Requires: firebase-admin, GOOGLE_APPLICATION_CREDENTIALS (service account key)
 */

const fs = require('fs');
const path = require('path');
const admin = require(path.join(__dirname, '../functions/node_modules/firebase-admin'));

let place, folderPath;
if (process.argv.length === 4) {
  place = process.argv[2];
  folderPath = process.argv[3];
} else if (process.argv.length === 3) {
  folderPath = process.argv[2];
  const folderName = path.basename(path.resolve(folderPath));
  if (folderName.startsWith('MYOS ')) {
    place = folderName.slice(5).toLowerCase().replace(/-compressed$/, '').replace(/\s+/g, '');
  } else {
    console.error('Folder must be named "MYOS [Place]" (e.g. MYOS Mexico) when using single-arg mode.');
    process.exit(1);
  }
} else {
  console.error('Usage: node scripts/upload-photos.js <place> <folder-path>');
  console.error('   or: node scripts/upload-photos.js "photos-to-upload/MYOS Mexico"');
  process.exit(1);
}

if (!fs.existsSync(folderPath)) {
  console.error('Folder not found:', folderPath);
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({ projectId: 'myos1-8e625' });
  } catch (e) {
    console.error('Firebase init failed. Set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.');
    process.exit(1);
  }
}

const bucket = admin.storage().bucket('myos1-8e625.appspot.com');
const files = fs.readdirSync(folderPath).filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
const sorted = files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

console.log(`Uploading ${sorted.length} photos to photos/${place}/...`);

async function upload() {
  for (let i = 0; i < sorted.length; i++) {
    const file = sorted[i];
    const ext = path.extname(file);
    const destName = `photos/${place}/${String(i + 1).padStart(3, '0')}${ext}`;
    await bucket.upload(path.join(folderPath, file), {
      destination: destName,
      metadata: { contentType: `image/${ext.slice(1).toLowerCase()}` },
    });
    console.log(`  ${i + 1}/${sorted.length}: ${file} → ${destName}`);
  }
  console.log('Done!');
}

upload().catch((err) => {
  console.error(err);
  process.exit(1);
});
