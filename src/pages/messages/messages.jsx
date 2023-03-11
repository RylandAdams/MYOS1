import React from 'react';
import './messages.css';

import { Link } from 'react-router-dom';
import { RxCaretRight } from 'react-icons/rx';

const Messages = () => {
	return (
		<div className='messagesPage'>
			<div className='topBarIpod'></div>
			<h1 className='HEADERmessages'>Messages</h1>
			<Link
				to={`/messages/RickRubin`}
				className='convo1Bar'
			>
				<div className='personsName'>Mr.Rubin</div>
				<RxCaretRight className='messageCaret' />
			</Link>

			<Link
				to={`/messages/LouisBell`}
				className='convo2Bar'
			>
				<div className='personsName'>Louis Bell</div>
				<RxCaretRight className='messageCaret' />
			</Link>
		</div>
	);
};

export default Messages;
