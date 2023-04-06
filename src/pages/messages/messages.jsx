import React from 'react';
import './messages.css';

import typing from '../../assets/imgs/typing.png';
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
				<div className='nameCircle'>
					<div className='circleNameRR'>RR</div>
				</div>
				<div className='personsName'>Mr.Rubin</div>
				<img
					src={typing}
					alt='typing'
					className='rickTypingMessages'
				/>
				<RxCaretRight className='messageCaret' />
			</Link>

			<Link
				to={`/messages/Virmedius`}
				className='convo2Bar'
			>
				<div className='nameCircle'>
					<div className='circleNameLB'>V</div>
				</div>
				<div className='personsName'>Virmedius</div>
				<div className='louisTypingMessages'>This is where im at</div>
				<RxCaretRight className='messageCaret' />
			</Link>
		</div>
	);
};

export default Messages;
