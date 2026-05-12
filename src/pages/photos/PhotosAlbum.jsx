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

/** Served from `public/corvallis/` — Photos → Places → Corvallis */
const CORVALLIS_PHOTOS = [
	{ src: '/corvallis/band-rehearsal.png', title: 'Band rehearsal' },
	{ src: '/corvallis/avocado-toast-acai.png', title: 'Avocado toast & acai' },
	{ src: '/corvallis/bowling-scoreboard-lane18.png', title: 'Bowling — lane 18' },
	{ src: '/corvallis/tree-canopy-from-below.png', title: 'Tree canopy' },
	{ src: '/corvallis/after-hours-tshirt-graphic.png', title: 'After Hours tee' },
	{ src: '/corvallis/black-cat-cherry-blossoms.png', title: 'Cat & blossoms' },
	{ src: '/corvallis/nintendo-switch-sports-bowling-results.png', title: 'Switch Sports bowling' },
	{ src: FineByMe, title: 'Fine By Me' },
];

/** Served from `public/eugene/` — Photos → Places → Eugene */
const EUGENE_PHOTOS = [
	{ src: '/eugene/living-room-studio-art.png', title: 'Living room studio' },
	{ src: '/eugene/tabby-cat-leather-couch.png', title: 'Tabby on couch' },
	{ src: '/eugene/lemon-dessert-ice.png', title: 'Lemon dessert' },
	{ src: '/eugene/home-music-studio-desk.png', title: 'Attic desk studio' },
	{ src: '/eugene/bathtub-guitar-green-tub.png', title: 'Bathtub jam' },
	{ src: '/eugene/living-room-yellow-couch-evening.png', title: 'Evening gathering' },
	{ src: '/eugene/night-handstand-grass-tree.png', title: 'Night handstand' },
	{ src: '/eugene/clownfish-lock-screen-dev-setup.png', title: 'Lock screen build' },
	{ src: '/eugene/goodwill-cart-clothes-haul.png', title: 'Goodwill run' },
	{ src: '/eugene/car-window-city-night.png', title: 'City night ride' },
	{ src: '/eugene/home-pioneer-dj-booth.png', title: 'Home Pioneer DJ booth' },
	{ src: '/eugene/mirror-hall-heater-plants.png', title: 'Hallway mirror & plants' },
	{ src: '/eugene/portrait-brown-hoodie.png', title: 'Brown hoodie selfie' },
	{ src: '/eugene/ableton-live-arrangement.png', title: 'Ableton arrangement' },
	{ src: '/eugene/shadows-roll-up-door.png', title: 'Shadows • roll-up door' },
	{ src: '/eugene/winter-eugene-tactics-snow.png', title: 'Snow downtown • Tactics' },
	{ src: '/eugene/outdoor-photo-shoot-under-bridge.png', title: 'Shoot under bridge' },
	{ src: BHDenialSingle, title: 'BH Denial' },
];

/** Served from `public/portland/` — Photos → Places → Portland */
const PORTLAND_PHOTOS = [
	{ src: '/portland/portland-photo-01.png', title: 'Portland snapshot 1' },
	{ src: '/portland/portland-photo-02.png', title: 'Portland snapshot 2' },
	{ src: '/portland/portland-photo-03.png', title: 'Portland snapshot 3' },
	{ src: '/portland/portland-photo-04.png', title: 'Portland snapshot 4' },
	{ src: '/portland/portland-photo-05.png', title: 'Portland snapshot 5' },
	{ src: '/portland/portland-photo-06.png', title: 'Portland snapshot 6' },
	{ src: '/portland/portland-photo-07.png', title: 'Portland snapshot 7' },
	{ src: '/portland/porch-railing-smile.png', title: 'Porch railing' },
	{ src: '/portland/park-lawn-summer.png', title: 'Park lawn' },
	{ src: '/portland/vintage-horror-posters-rack.png', title: 'Poster rack' },
	{ src: '/portland/two-tabby-cats-bed.png', title: 'Two tabbies' },
	{ src: '/portland/neon-night-pool-party.png', title: 'Night pool' },
	{ src: '/portland/nightclub-led-screens.png', title: 'LED crowd' },
	{ src: '/portland/attic-genelec-edit-suite.png', title: 'Edit suite' },
	{ src: '/portland/three-friends-parking-lot-sunset.png', title: 'Parking lot trio' },
	{ src: '/portland/river-tubes-pickup-day.png', title: 'Tubes day' },
	{ src: '/portland/river-wakesurfing.png', title: 'Wake surf' },
	{ src: '/portland/car-rear-window-stickers.png', title: 'Stickered car' },
	{ src: '/portland/dog-dormer-teal-house.png', title: 'Dog at the window' },
	{ src: '/portland/two-friends-interior-ledge.png', title: 'Interior ledge' },
	{ src: '/portland/three-polaroids-wood-table.png', title: 'Polaroids' },
	{ src: '/portland/csgo-ten-year-veteran-coin.png', title: 'Ten year coin' },
	{ src: '/portland/bnw-car-phone-night.png', title: 'Night ride' },
	{ src: '/portland/home-studio-green-light.png', title: 'Green-lit studio' },
	{ src: '/portland/red-porsche-cherry-blossom-night.png', title: '911 under blossoms' },
	{ src: '/portland/kitchen-island-dinner-prep.png', title: 'Kitchen island' },
	{ src: '/portland/wetsuit-sunny-selfie.png', title: 'Sunny selfie' },
	{ src: '/portland/guitar-studio-through-doorway.png', title: 'Through the doorway' },
	{ src: '/portland/grand-piano-waterfront-living.png', title: 'Piano room' },
	{ src: '/portland/daw-rehearsal-steakhouse-collage.png', title: 'Studio collage' },
	{ src: '/portland/lelas-vietnamese-bistro-outdoor.png', title: "Lela's Bistro" },
	{ src: '/portland/six-panel-studio-life-collage.png', title: 'Day-in-the-life collage' },
	{ src: '/portland/loft-leopard-rug-office.png', title: 'Leopard rug loft' },
	{ src: DriveBlur, title: 'Night blur' },
];

/** Served from `public/new-york/` — Photos → Places → New York */
const NEW_YORK_PHOTOS = [
	{ src: '/new-york/natural-history-meteorite.png', title: 'Meteorite hall' },
	{ src: '/new-york/knockdown-center-marquee.png', title: 'Knockdown Center' },
	{ src: '/new-york/manhattan-rooftop-pool-night.png', title: 'Manhattan night' },
	{ src: '/new-york/hotel-mirror-selfie.png', title: 'Hotel mirror' },
	{ src: '/new-york/moma-gallery-grid.png', title: 'MoMA' },
	{ src: '/new-york/broadway-hadestown-stage.png', title: 'Hadestown' },
];

const ALL_PHOTOS = [
	{ src: DriveBlur, title: 'Drive Blur' },
	{ src: BHDenialSingle, title: 'BH Denial' },
	{ src: FineByMe, title: 'Fine By Me' },
	{ src: Glisan, title: 'Glisan' },
	{ src: RhodesRoom, title: "Rhodes Room" },
	{ src: RiceNSpice, title: 'Rice N Spice' },
	{ src: RylandStudioSide, title: 'Studio' },
];

/** Bundled snaps + `public/dayton/` — Photos → Places → Dayton */
const DAYTON_PHOTOS = [
	{ src: '/dayton/shark-inflatable-slide.png', title: 'Shark slide' },
	{ src: '/dayton/stage-home-lettering-band.png', title: 'Stage — HOME' },
	{ src: '/dayton/music-store-acoustic-couch.png', title: 'Guitar store' },
	{ src: '/dayton/roof-setup-golden-hour.png', title: 'Roof load-in' },
	{ src: '/dayton/snowboard-air-vertical.png', title: 'Snowboard air' },
	{ src: '/dayton/band-outdoor-stage-canopy.png', title: 'Outdoor stage' },
];

const FOLDER_PHOTOS = {
	portland: PORTLAND_PHOTOS,
	'new-york': NEW_YORK_PHOTOS,
	dayton: DAYTON_PHOTOS,
	corvallis: CORVALLIS_PHOTOS,
	eugene: EUGENE_PHOTOS,
};

// Timeline for Recents: **oldest trip first** in this list. Recents then shows **newest trip first**
// (Mexico), each trip’s shots **newest-first** within the block — similar to the iOS Photos “Recents” roll.
// Album arrays should keep shots in **chronological order** (oldest → newest) for sensible ordering.
const PLACES_TIMELINE_OLDEST_TO_NEWEST = [
	'dayton',
	'corvallis',
	'eugene',
	'portland',
	'new-york',
	'mexico',
];

function getPlacePhotos(placeId) {
	if (isLocalPlace(placeId)) {
		return getLocalPhotoList(placeId);
	}
	return FOLDER_PHOTOS[placeId] || [];
}

function getRecentsFromPlaces() {
	const blocksNewestTripFirst = [...PLACES_TIMELINE_OLDEST_TO_NEWEST].reverse().map((placeId) =>
		[...getPlacePhotos(placeId)].reverse(),
	);
	const flattened = blocksNewestTripFirst.flat();
	const seen = new Set();
	return flattened.filter((p) => {
		const key = String(p.src);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
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

		const loadAndMeasure = (list) =>
			Promise.all(list.map(measure)).then((out) => {
				if (alive) {
					setPhotos(out);
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (alive) setIsReady(true);
						});
					});
				}
			});

		if (isLocalPlace(folderId)) {
			const list = getLocalPhotoList(folderId);
			loadAndMeasure(list);
		} else if (folderId === 'recents') {
			const list = getRecentsFromPlaces();
			loadAndMeasure(list);
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
