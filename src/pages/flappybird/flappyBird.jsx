import React from 'react';
import './flappyBird.css';
import Iframe from 'react-iframe';
import { Dots } from 'loading-animations-react';

const Flappybird = () => {
	return (
		<div className='game'>
			<div className='loading'>
				<Dots />
			</div>
			<Iframe
				scrolling='no'
				url='https://playcanv.as/p/2OlkUaxF/'
				className='gameWindow'
			/>
		</div>
	);
};

export default Flappybird;
