import React from 'react';
import './flappyBird.css';

import GameImport from './gameImport';

const Flappybird = () => {
	// -------------------------------------------
	const game = GameImport('./index.html');
	// -------------------------------------------

	return <div className='game'>{game}</div>;
};

export default Flappybird;
