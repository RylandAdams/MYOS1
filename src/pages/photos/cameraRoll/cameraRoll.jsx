import React, { useState, useCallback } from 'react';
import './cameraRoll.css';

import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';

import RylandStudioSide from './photos/RylandStudioSide.png';
import Glisan from './photos/Glisan.png';
import SkateboardBed from './photos/SkateboardBed.png';
import RiceNSpice from './photos/RiceNSpice.png';
import RhodesRoom from './photos/RhodesRoom.png';
import OGDenialSingle from './photos/OGDenialSingle.png';
import FineByMe from './photos/FineByMe.png';
import DriveBlur from './photos/DriveBlur.png';
import BHDenialSingle from './photos/BHDenialSingle.png';

const photos = [
	{
		src: DriveBlur,
		width: 1,
		height: 0.6,
	},
	{
		src: RylandStudioSide,
		width: 1,
		height: 0.8,
	},
	{
		src: Glisan,
		width: 0.1,
		height: 0.1,
	},
	{
		src: BHDenialSingle,
		width: 1,
		height: 1,
	},
	{
		src: FineByMe,
		width: 1,
		height: 1,
	},
	{
		src: RiceNSpice,
		width: 1,
		height: 1,
	},
	{
		src: RhodesRoom,
		width: 1,
		height: 1,
	},
];

const CameraRoll = () => {
	const [currentImage, setCurrentImage] = useState(0);
	const [viewerIsOpen, setViewerIsOpen] = useState(false);

	const openLightbox = useCallback((event, { photo, index }) => {
		setCurrentImage(index);
		setViewerIsOpen(true);
	}, []);

	const closeLightbox = () => {
		setCurrentImage(0);
		setViewerIsOpen(false);
	};
	return (
		<div className='cameraRollPage'>
			<Gallery
				photos={photos}
				direction={'column'}
				onClick={openLightbox}
			/>
			<ModalGateway>
				{viewerIsOpen ? (
					<Modal
						className='pictureViewer'
						onClose={closeLightbox}
					>
						{/* <Carousel
							currentIndex={currentImage}
							views={photos.map((x) => ({
								...x,
								srcset: x.srcSet,
								caption: x.title,
							}))}
						/> */}
					</Modal>
				) : null}
			</ModalGateway>
		</div>
	);
};

export default CameraRoll;
