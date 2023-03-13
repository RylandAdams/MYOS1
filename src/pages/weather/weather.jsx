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
			<a>
				<img
					src='https://images.cooltext.com/5647878.gif'
					width='218'
					height='85'
					alt='WARNING'
					className='heatwave'
				/>
			</a>
			<h1 className='warning'>WARNING</h1>

			{/* <img
				src={Warning}
				alt='Warning'
				className='warning'
			/> */}
			{/* <img
				src={heatwave}
				alt='heatwave'
				className='heatwave'
			/> */}
			<div className='barbottom'></div>
			<div className='barbottomUp1'></div>
			<div className='barbottomUp2'></div>
			<div className='barbottomUp3'></div>
		</div>
	);
};

export default Weather;
