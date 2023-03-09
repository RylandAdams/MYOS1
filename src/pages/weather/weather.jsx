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
					// frameBorder='1'
				></Iframe>
			</div>
			<p>
				<a href='https://gifer.com'></a>
			</p>
		</div>
	);
};

export default Weather;
