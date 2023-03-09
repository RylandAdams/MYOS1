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
			<a
				href='https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A'
				className='ShareCard'
			>
				s
			</a>
			<a
				href='https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A'
				className='SpotifyCard'
			>
				Spotify
			</a>
			<a
				href='https://music.apple.com/us/artist/ryland/1620591111'
				className='AppleCard'
			>
				Apple Music
			</a>
			<a
				href='https://instagram.com/__.ryland.__?igshid=MjkzY2Y1YTY='
				className='InstaCard'
			>
				Instagram
			</a>
		</>
	);
};

export default Safari;
