import React from 'react';
import './flappyBird.css';

const Flappybird = () => {
	return (
		<div className='game'>
			<iframe
				src='https://flappybird.io/'
				className='gameWindow'
				title='Flappy Bird'
				allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; fullscreen'
			/>
		</div>
	);
};

export default Flappybird;
