import React from 'react';
import './flappyBird.css';

const Flappybird = () => {
	return (
		<div className='game'>
			<iframe
				src='https://playcanv.as/p/bSj5XiQn'
				className='gameWindow'
				title='Flappy Bird'
				allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope'
			/>
		</div>
	);
};

export default Flappybird;
