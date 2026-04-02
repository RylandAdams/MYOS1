import React from 'react';
import './messages.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import typing from '../../assets/imgs/typing.png';
import { Link } from 'react-router-dom';
import { RxCaretRight } from 'react-icons/rx';

const Messages = () => {
	return (
		<div className='messagesPage'>
			<AppHeaderBar title="Messages" />
			<Link
				to={`/messages/RickRubin`}
				className='convo1Bar'
			>
				<div className='nameCircle'>
					<div className='circleNameRR'>RR</div>
				</div>
				<div className='personsName'>Rick Rubin</div>
				<img
					src={typing}
					alt='typing'
					className='rickTypingMessages'
					loading="lazy"
				/>
				<RxCaretRight className='messageCaret' />
			</Link>

			{/* <Link
				to={`/messages/Virmedius`}
				className='convo2Bar'
			>
				<div className='nameCircle'>
					<div className='circleNameLB'>V</div>
				</div>
				<div className='personsName'>Virmedius</div>
				<div className='louisTypingMessages'>
					Congrats on the playlist...
				</div>
				<RxCaretRight className='messageCaret' />
			</Link> */}
		</div>
	);
};

export default Messages;
