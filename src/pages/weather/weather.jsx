import React from 'react';
import Iframe from 'react-iframe';
import './weather.css';

const Weather = () => {
	return (
		<div className='weatherPage'>
			<div>
				<Iframe
					className='spongebob'
					src='https://gifer.com/embed/3x'
				></Iframe>
			</div>
			<h1 className='warning'>WARNING</h1>
			<h1 className='heatwave'>HEATWAVE</h1>
			<h1 className='weatherDate'>MARCH 31</h1>
			<div className='barbottom'></div>
			<div className='barbottomUp1'></div>
			<div className='barbottomUp2'></div>
			<div className='barbottomUp3'></div>
		</div>
	);
};

export default Weather;
