import React from 'react';
import './flappyBird.css';
import Iframe from 'react-iframe';

const Flappybird = () => {
	return (
		<div className='game'>
			<Iframe
				scrolling='no'
				url='https://playcanv.as/p/2OlkUaxF/'
				width='130%'
				height='120%'
				// id=''
				// className=''
				// display='block'
				// position='relative'
			/>
		</div>
	);
};

export default Flappybird;
