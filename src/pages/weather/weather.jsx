import React from 'react';
import Iframe from 'react-iframe';
import './weather.css';

import Warning from './WeatherImgs/Warning.png';
import heatwave from './WeatherImgs/heatwave.png';

const Weather = () => {
	return (
		<div className='weatherPage'>
			<div>
				<Iframe
					className='spongebob'
					src='https://gifer.com/embed/3x'
					// frameBorder='1'
				></Iframe>
			</div>
			<img
				src={Warning}
				alt='Warning'
				className='warning'
			/>
			<img
				src={heatwave}
				alt='heatwave'
				className='heatwave'
			/>

			<div className='bar'></div>
		</div>
	);
};

export default Weather;
