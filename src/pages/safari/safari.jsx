import React from 'react';
import './safari.css';

import flowcard from '../../assets/imgs/Flow.png';

const Safari = () => {
	return (
		<>
			<img
				className='safariPage'
				src={flowcard}
				alt='flowcard'
			/>
			<button
				href='https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A'
				className='ShareCard'
			></button>
			<button
				href='https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A'
				className='SpotifyCard'
			></button>
			<button
				href='https://music.apple.com/us/artist/ryland/1620591111'
				className='AppleCard'
			></button>
			<button
				href='https://instagram.com/__.ryland.__?igshid=MjkzY2Y1YTY='
				className='InstaCard'
			></button>
		</>
	);
};

export default Safari;
