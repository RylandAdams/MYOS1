import React from 'react';
import './lockScreen.css';

import SlideToUnlock from '../slideToUnlock/slideToUnlock';

import lockScreenBackground from '../../assets/imgs/lockScreenBackground.JPG';

const LockScreen = () => {
	return (
		<div className='lockScreenPage'>
			<img
				src={lockScreenBackground}
				alt=''
				className='lockScreenPicture'
			/>
			<SlideToUnlock />
		</div>
	);
};

export default LockScreen;
