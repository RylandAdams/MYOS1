import React, { useEffect, useRef, useState } from 'react';
import './photos.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { ALBUMS, thumbSrc, viewSrc } from './photosData';

/* iPhone OS Photos: Photo Albums list → 4-across thumbnail grid → black full-screen viewer
   (inside the phone screen). Grids load 160px thumbnails; the viewer loads phone-sized images. */

const SWIPE_PX = 45;

function Viewer({ album, index, onIndex, onClose }) {
	const [chrome, setChrome] = useState(true);
	const [dx, setDx] = useState(0);
	const drag = useRef(null);
	const photos = album.photos;
	const photo = photos[index];

	// Warm the neighbours so swiping feels instant
	useEffect(() => {
		[index - 1, index + 1].forEach((i) => {
			if (photos[i]) new Image().src = viewSrc(photos[i]);
		});
	}, [index, photos]);

	const go = (step) => {
		const next = index + step;
		if (next >= 0 && next < photos.length) onIndex(next);
	};

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === 'ArrowRight') go(1);
			else if (e.key === 'ArrowLeft') go(-1);
			else if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	const onDown = (e) => {
		drag.current = { x: e.clientX, moved: false };
		e.currentTarget.setPointerCapture?.(e.pointerId);
	};
	const onMove = (e) => {
		if (!drag.current) return;
		const d = e.clientX - drag.current.x;
		if (Math.abs(d) > 4) drag.current.moved = true;
		// resist at the ends
		const atEnd = (d > 0 && index === 0) || (d < 0 && index === photos.length - 1);
		setDx(atEnd ? d * 0.3 : d);
	};
	const onUp = () => {
		const d = dx;
		const moved = drag.current?.moved;
		drag.current = null;
		setDx(0);
		if (d <= -SWIPE_PX) go(1);
		else if (d >= SWIPE_PX) go(-1);
		else if (!moved) setChrome((c) => !c);
	};

	return (
		<div className="phViewer" role="dialog" aria-label={`${album.label}, photo ${index + 1} of ${photos.length}`}>
			<div
				className="phStage"
				onPointerDown={onDown}
				onPointerMove={onMove}
				onPointerUp={onUp}
				onPointerCancel={onUp}
			>
				<img
					key={photo.rel}
					className="phFull"
					src={viewSrc(photo)}
					alt={photo.title || ''}
					draggable={false}
					style={{ transform: `translateX(${dx}px)`, transition: dx ? 'none' : 'transform 0.2s ease-out' }}
				/>
			</div>
			<div className={`phViewerBar${chrome ? '' : ' phHidden'}`}>
				<button type="button" className="phViewerBack" onClick={onClose}>
					{album.label}
				</button>
				<span className="phViewerCount">
					{index + 1} of {photos.length}
				</span>
			</div>
			<div className={`phViewerTools${chrome ? '' : ' phHidden'}`}>
				<button type="button" className="phArrow" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous photo">
					<span className="phArrowLeft" />
				</button>
				<button type="button" className="phArrow" onClick={() => go(1)} disabled={index === photos.length - 1} aria-label="Next photo">
					<span className="phArrowRight" />
				</button>
			</div>
		</div>
	);
}

const Photos = () => {
	const [albumId, setAlbumId] = useState(null);
	const [viewIndex, setViewIndex] = useState(-1);
	const album = ALBUMS.find((a) => a.id === albumId);

	const header = album
		? { title: album.label, backLabel: 'Photo Albums', onBack: () => setAlbumId(null) }
		: { title: 'Photo Albums' };

	return (
		<div className="photosPage">
			<AppHeaderBar {...header} />

			<div className="phScroll" key={albumId || 'albums'}>
				{!album ? (
					<ul className="phAlbums">
						{ALBUMS.map((a) => (
							<li key={a.id}>
								<button type="button" className="phAlbumRow" onClick={() => setAlbumId(a.id)}>
									<img className="phAlbumThumb" src={thumbSrc(a.photos[0])} alt="" loading="lazy" decoding="async" />
									<span className="phAlbumName">{a.label}</span>
									<span className="phAlbumCount">({a.photos.length})</span>
									<span className="phChevron">›</span>
								</button>
							</li>
						))}
					</ul>
				) : (
					<>
						<div className="phGrid">
							{album.photos.map((p, i) => (
								<button type="button" key={p.rel} className="phCell" onClick={() => setViewIndex(i)} aria-label={p.title || `Photo ${i + 1}`}>
									<img src={thumbSrc(p)} alt="" loading="lazy" decoding="async" />
								</button>
							))}
						</div>
						<div className="phFooter">{album.photos.length} Photos</div>
					</>
				)}
			</div>

			{album && viewIndex >= 0 && (
				<Viewer album={album} index={viewIndex} onIndex={setViewIndex} onClose={() => setViewIndex(-1)} />
			)}
		</div>
	);
};

export default Photos;
