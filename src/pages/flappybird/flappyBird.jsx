import React from 'react';
import './flappyBird.css';

const Flappybird = () => {
	return (
		<div className='game'>
			<header>
				<div className='score-container'>
					<div id='bestScore'></div>
					<div id='currentScore'></div>
				</div>
			</header>

			<canvas
				id='canvas'
				// className='canvas'
				width='300%'
				height='450%'
			></canvas>
		</div>
	);
};

export default Flappybird;
