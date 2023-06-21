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
				target='_blank'
				href='https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A'
				className='ShareCard'
			>
				s
			</a>
			<a
				target='_blank'
				href='https://open.spotify.com/artist/4E3V4UPKl6i0EBlA2ZDKNQ?si=8uyjrQ0mSnW8BjUAtAdr0A'
				className='SpotifyCard'
			>
				s
			</a>
			<a
				target='_blank'
				href='https://music.apple.com/us/artist/ryland/1620591111'
				className='AppleCard'
			>
				a
			</a>
			<a
				target='_blank'
				href='https://instagram.com/ryland.wav?igshid=MjEwN2IyYWYwYw=='
				className='InstaCard'
			>
				s
			</a>
		</>
	);
};

export default Safari;
