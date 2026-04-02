import React, { useState, useEffect } from 'react';
import PhotoAlbum from 'react-photo-album';
import 'react-photo-album/styles.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import RylandStudioSide from './cameraRoll/photos/RylandStudioSide.jpg';
import Glisan from './cameraRoll/photos/Glisan.png';
import RiceNSpice from './cameraRoll/photos/RiceNSpice.jpg';
import RhodesRoom from './cameraRoll/photos/RhodesRoom.png';
import FineByMe from './cameraRoll/photos/FineByMe.jpg';
import DriveBlur from './cameraRoll/photos/DriveBlur.png';
import BHDenialSingle from './cameraRoll/photos/BHDenialSingle.jpg';
import { isLocalPlace, getLocalPhotoList } from '../../utils/photoStorage';

const ALL_PHOTOS = [
	{ src: DriveBlur, title: 'Drive Blur' },
	{ src: BHDenialSingle, title: 'BH Denial' },
	{ src: FineByMe, title: 'Fine By Me' },
	{ src: Glisan, title: 'Glisan' },
	{ src: RhodesRoom, title: "Rhodes Room" },
	{ src: RiceNSpice, title: 'Rice N Spice' },
	{ src: RylandStudioSide, title: 'Studio' },
];

const FOLDER_PHOTOS = {
	portland: [
		ALL_PHOTOS[3], ALL_PHOTOS[4], ALL_PHOTOS[5], ALL_PHOTOS[0],
	],
	dayton: [
		ALL_PHOTOS[0], ALL_PHOTOS[1], ALL_PHOTOS[2],
	],
	corvallis: [
		ALL_PHOTOS[3], ALL_PHOTOS[5], ALL_PHOTOS[6],
	],
	eugene: [
		ALL_PHOTOS[4], ALL_PHOTOS[5], ALL_PHOTOS[6],
	],
};

// Order shown in Places menu (oldest place -> newest place).
const PLACE_ORDER = ['dayton', 'corvallis', 'eugene', 'portland', 'mexico'];

function getPlacePhotos(placeId) {
	if (isLocalPlace(placeId)) {
		return getLocalPhotoList(placeId);
	}
	return FOLDER_PHOTOS[placeId] || [];
}

function getRecentsFromPlaces() {
	// Places albums are oldest -> newest; Recents should be newest -> oldest across all places.
	const chronological = PLACE_ORDER.flatMap((placeId) => getPlacePhotos(placeId));
	return [...chronological].reverse();
}

function measure(photo) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () =>
			resolve({
				...photo,
				width: img.naturalWidth || 800,
				height: img.naturalHeight || 600,
			});
		img.onerror = () => resolve({ ...photo, width: 800, height: 600 });
		img.src = photo.src;
	});
}

export default function PhotosAlbum({ folderId }) {
	const [photos, setPhotos] = useState([]);
	const [index, setIndex] = useState(-1);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let alive = true;
		setIsReady(false);
		setPhotos([]);

		const loadAndMeasure = (list, triple = true) => {
			const toLoad = triple && list.length < 20 ? [...list, ...list, ...list] : list;
			return Promise.all(toLoad.map(measure)).then((out) => {
				if (alive) {
					setPhotos(out);
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (alive) setIsReady(true);
						});
					});
				}
			});
		};

		if (isLocalPlace(folderId)) {
			const list = getLocalPhotoList(folderId);
			loadAndMeasure(list, false);
		} else if (folderId === 'recents') {
			const list = getRecentsFromPlaces();
			loadAndMeasure(list, false);
		} else {
			const list = FOLDER_PHOTOS[folderId] || ALL_PHOTOS;
			loadAndMeasure(list);
		}

		return () => { alive = false; };
	}, [folderId]);

	return (
		<div className="photosAlbum" style={{ minHeight: 280 }}>
			{photos.length === 0 ? (
				<div className="photosLoading">Loading…</div>
			) : (
				<div
					className="photosGridWrap"
					style={{
						opacity: isReady ? 1 : 0,
						transition: 'opacity 0.15s ease-out',
					}}
				>
					<PhotoAlbum
						layout="masonry"
						columns={3}
						spacing={0}
						padding={0}
						photos={photos}
						breakpoints={[320, 600, 1200]}
						defaultContainerWidth={260}
						onClick={({ index: i }) => setIndex(i)}
						renderPhoto={({ imageProps }) => (
							<img
								{...imageProps}
								loading="lazy"
								alt=""
								style={{
									...imageProps.style,
									display: 'block',
									borderRadius: 0,
									objectFit: 'cover',
								}}
							/>
						)}
					/>
				</div>
			)}
			<Lightbox
				open={index >= 0}
				close={() => setIndex(-1)}
				index={index}
				slides={photos.map((p) => ({ src: p.src }))}
				controller={{ closeOnBackdropClick: true }}
				styles={{ container: { backgroundColor: 'rgba(0,0,0,0.95)' } }}
			/>
		</div>
	);
}
