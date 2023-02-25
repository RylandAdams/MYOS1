import React, { useState, useEffect } from 'react';
import './topBar.css';

const TopBar = () => {
	const [date, setDate] = useState(new Date());

	function refreshClock() {
		setDate(new Date());
	}

	useEffect(() => {
		const timerId = setInterval(refreshClock, 1000);
		return function cleanup() {
			clearInterval(timerId);
		};
	}, []);

	return (
		<div className='topBar'>
			<div className='clock'>
				{date.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}
			</div>
		</div>
	);
};

export default TopBar;
