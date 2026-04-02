import React, { useState } from 'react';
import './photos.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import PhotosAlbum from './PhotosAlbum';

const FOLDERS = [
	{ id: 'recents', label: 'Recents', icon: 'clock' },
	{ id: 'places', label: 'Places', icon: 'map', isFolder: true },
];

const PLACES = [
	{ id: 'dayton', label: 'Dayton' },
	{ id: 'corvallis', label: 'Corvallis' },
	{ id: 'eugene', label: 'Eugene' },
	{ id: 'portland', label: 'Portland' },
	{ id: 'mexico', label: 'Mexico' },
];

const Photos = () => {
	const [selectedFolder, setSelectedFolder] = useState(null);
	const [view, setView] = useState('menu'); // 'menu' | 'places' | 'album'
	const [fromPlaces, setFromPlaces] = useState(false);

	const handleBack = () => {
		if (view === 'album') {
			if (fromPlaces) {
				setView('places');
				setSelectedFolder(null);
				setFromPlaces(false);
			} else {
				setView('menu');
				setSelectedFolder(null);
			}
		} else if (view === 'places') {
			setView('menu');
		}
	};

	const handleFolderClick = (folder) => {
		if (folder.isFolder && folder.id === 'places') {
			setView('places');
		} else {
			setView('album');
			setSelectedFolder(folder.id);
			setFromPlaces(false);
		}
	};

	const handlePlaceClick = (place) => {
		setView('album');
		setSelectedFolder(place.id);
		setFromPlaces(true);
	};

	const getHeaderProps = () => {
		if (view === 'menu') {
			return { title: 'Photos' };
		}
		if (view === 'places') {
			return {
				title: 'Places',
				backLabel: 'Photos',
				onBack: handleBack,
			};
		}
		// album view
		const place = PLACES.find((p) => p.id === selectedFolder);
		const folder = FOLDERS.find((f) => f.id === selectedFolder);
		const pageTitle = place?.label || folder?.label || 'Photos';
		return {
			title: pageTitle,
			backLabel: fromPlaces ? 'Places' : 'Photos',
			onBack: handleBack,
		};
	};

	return (
		<div className="photosPage">
			<AppHeaderBar {...getHeaderProps()} />
			<div className={`photosContent ${view === 'album' ? 'photosContent--album' : ''}`}>
				{view === 'menu' && (
					<div className="photosFolderGrid">
						{FOLDERS.map((folder) => (
							<button
								key={folder.id}
								className="photosFolderIconBtn"
								onClick={() => handleFolderClick(folder)}
							>
								<div className="photosFolderIconWrap">
									<div className="photosFolderIconInner">
										<span className={`photosFolderIconSymbol photosFolderIcon-${folder.icon}`} />
									</div>
								</div>
								<span className="photosFolderLabel">{folder.label}</span>
							</button>
						))}
					</div>
				)}
				{view === 'places' && (
					<div className="photosPlacesMenu">
						<div className="photosFolderGrid">
							{PLACES.map((place) => (
								<button
									key={place.id}
									className="photosFolderIconBtn"
									onClick={() => handlePlaceClick(place)}
								>
									<div className="photosFolderIconWrap">
										<div className="photosFolderIconInner">
											<span className="photosFolderIconSymbol photosFolderIcon-map" />
										</div>
									</div>
									<span className="photosFolderLabel">{place.label}</span>
								</button>
							))}
						</div>
					</div>
				)}
				{view === 'album' && (
					<PhotosAlbum folderId={selectedFolder} />
				)}
			</div>
		</div>
	);
};

export default Photos;
