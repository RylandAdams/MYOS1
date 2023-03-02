import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './topBar.css';

import BatteryGauge from 'react-battery-gauge';

const TopBar = () => {
	const [date, setDate] = useState(new Date());

	let location = useLocation();

	useEffect(() => {
		console.log(location.pathname);
	}, [location]);

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
		<div className={location.pathname === '/' ? 'topBar' : 'topBarAlt'}>
			<div className='left'>No SIM</div>
			<div className='clock'>
				{date.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}
			</div>
			<div className='right'>
				<BatteryGauge
					size={20}
					value={10}
				/>
			</div>
		</div>
	);
};

export default TopBar;
