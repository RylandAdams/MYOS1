# Photos Setup – Mexico & Other Places

Mexico photos (and future places) are stored in **Firebase Storage** for fast CDN delivery and easy updates without redeploying.

## 1. Enable Firebase Storage

1. Open [Firebase Console](https://console.firebase.google.com/project/myos1-8e625/storage)
2. Click **Get started** if Storage isn’t enabled yet

## 2. Deploy Storage Rules & Photo API

```bash
firebase deploy --only storage,functions:getPhotoUrls
```

## 3. Compress Large Photos (recommended for 300MB+ folders)

If your folder is huge (raw files, high-res), compress first:

```bash
npm install
node scripts/compress-photos.js "photos-to-upload/MYOS Mexico"
```

Output: `photos-to-upload/MYOS Mexico-compressed/` – resized to 1600px max, JPEG quality 85. Typically 300MB → ~15–30MB.

**RAW files (CR2, ARW, etc.):** Export to JPEG first; the script only handles JPEG, PNG, WebP, GIF, TIFF.

## 4. Upload Your Photos

**Folder naming:** Use `MYOS [Place]` (e.g. `MYOS Mexico`). Drop folders in `photos-to-upload/` in the project.

### Option A: Drop in project + upload script (recommended)

1. Drop your `MYOS Mexico` folder into `photos-to-upload/` in the project root
2. (Optional) Run compress script above if folder is large
3. Get a service account key: Firebase Console → Project Settings → Service Accounts → **Generate new private key**
4. Run:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
node scripts/upload-photos.js mexico "photos-to-upload/MYOS Mexico"
```

Or if you compressed: `"photos-to-upload/MYOS Mexico-compressed"`

The script derives the place (`mexico`) from the folder name and uploads to `photos/mexico/`.

### Option B: Explicit place + path

```bash
cd functions && node ../scripts/upload-photos.js mexico "/Users/ryland/Desktop/MYOS Mexico"
```

### Option C: Firebase Console (manual)

1. Go to [Storage](https://console.firebase.google.com/project/myos1-8e625/storage)
2. Create folder `photos`, then `mexico` inside it
3. Drag and drop images into `photos/mexico/`
4. Files are served in alphabetical order; the script renames to `001.jpg`, `002.jpg`, etc.

### Option D: gsutil (Google Cloud CLI)

```bash
gsutil -m cp -r "photos-to-upload/MYOS Mexico"/* gs://myos1-8e625.appspot.com/photos/mexico/
```

## 5. Image tips for performance

- The compress script handles this: 1600px max, JPEG 85
- Target ~80–150KB per image for fast loading

## 6. Adding more places

1. Add the place in `src/pages/photos/photos.jsx` (PLACES array)
2. Add the place id to `STORAGE_PLACES` in `src/utils/photoStorage.js`
3. Upload photos to `photos/<place-id>/` in Storage
