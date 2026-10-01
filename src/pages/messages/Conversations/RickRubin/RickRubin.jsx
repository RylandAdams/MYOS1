import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RickRubin.css';

import AppHeaderBar from '../../../../components/AppHeaderBar/AppHeaderBar';
import itunesCover from '../../../../assets/songs/itunesCover.png';

const DEMO_URL =
	'https://soundcloud.com/rylandofficialmusic/country-ibuprofen/s-C7MKFVD3y97?si=65b2282d37e547cfb4c895d06a8c9f85&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';

/* iPhone OS Text thread: pale blue-gray background, green glossy sent bubble on the right,
   gray received bubble on the left (Rick is typing…). */
const RickRubin = () => {
	const navigate = useNavigate();
	return (
		<div className="RickRubin">
			<AppHeaderBar title="Rick Rubin" backLabel="Messages" onBack={() => navigate('/messages')} />
			<div className="smsThread">
				<div className="smsStamp">Today 2:14 AM</div>

				<a className="smsBubble smsSent smsSong" href={DEMO_URL} target="_blank" rel="noopener noreferrer">
					<img src={itunesCover} alt="" className="smsSongArt" loading="lazy" />
					<span className="smsSongText">
						<span className="smsSongTitle">Listen Here</span>
						<span className="smsSongSub">DEMO</span>
					</span>
				</a>
				<div className="smsReceipt">Delivered</div>

				<div className="smsBubble smsRecv smsTyping" aria-label="Rick is typing">
					<i />
					<i />
					<i />
				</div>
			</div>
		</div>
	);
};

export default RickRubin;
