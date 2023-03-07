import React from 'react';
import './photos.css';

import CameraRoll from './cameraRoll/cameraRoll';

const Photos = () => {
	return (
		<div className='photosPage'>
			Photos
			<CameraRoll />
		</div>
	);
};

export default Photos;
