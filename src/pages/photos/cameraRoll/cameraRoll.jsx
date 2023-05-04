import React from 'react';
import './cameraRoll.css';

import Gallery from 'react-photo-gallery';

import RylandStudioSide from './photos/RylandStudioSide.png';
import Glisan from './photos/Glisan.png';
import RiceNSpice from './photos/RiceNSpice.png';
import RhodesRoom from './photos/RhodesRoom.png';
import FineByMe from './photos/FineByMe.png';
import DriveBlur from './photos/DriveBlur.png';
import BHDenialSingle from './photos/BHDenialSingle.png';

const photos = [
	{
		src: DriveBlur,
		loading: 'lazy',
		width: 1,
		height: 0.6,
	},
	{
		src: RylandStudioSide,
		loading: 'lazy',
		width: 1,
		height: 0.8,
	},
	{
		src: Glisan,
		loading: 'lazy',
		width: 0.1,
		height: 0.1,
	},
	{
		src: BHDenialSingle,
		loading: 'lazy',
		width: 1,
		height: 1,
	},
	{
		src: FineByMe,
		loading: 'lazy',
		width: 1,
		height: 1,
	},
	{
		src: RiceNSpice,
		loading: 'lazy',
		width: 1,
		height: 1,
	},
	{
		src: RhodesRoom,
		loading: 'lazy',
		width: 1,
		height: 1,
	},
];

const CameraRoll = () => {
	return (
		<div className='cameraRollPage'>
			<Gallery
				photos={photos}
				direction={'column'}
				onClick={''}
			/>
		</div>
	);
};

export default CameraRoll;
