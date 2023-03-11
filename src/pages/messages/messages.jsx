import React from 'react';
import './messages.css';

import { Link } from 'react-router-dom';

const Messages = () => {
	return (
		<div className='messagesPage'>
			<Link
				to={`/messages/RickRubin`}
				className='RickConvo'
			>
				Mr.Rubin
			</Link>
			<Link
				to={`/messages/LouisBell`}
				className='LouisConvo'
			>
				Louis Bell
			</Link>
		</div>
	);
};

export default Messages;
