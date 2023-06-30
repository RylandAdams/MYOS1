import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './topBar.css';

import { GiNetworkBars } from 'react-icons/gi';
import { FaBatteryFull } from 'react-icons/fa';

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
		<div
			className={
				location.pathname === '/lockScreen' ? 'topBar' : 'topBarAlt'
			}
		>
			<div
				className={
					location.pathname === 'lockScreen' ? 'left' : 'leftAlt'
				}
			>
				RYLAND
				<GiNetworkBars
					color={
						location.pathname === 'lockScreen'
							? '#d2d2d2'
							: '#000000'
					}
					fill={
						location.pathname === '/lockScreen'
							? '#d2d2d2'
							: '#000000'
					}
					className={
						location.pathname === '/lockScreen'
							? 'cellularBars'
							: 'cellularBarsAlt'
					}
				/>
			</div>
			<div
				className={
					location.pathname === '/lockScreen' ? 'clock' : 'clockAlt'
				}
			>
				{date.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				})}
			</div>
			<div
				className={
					location.pathname === '/lockScreen' ? 'right' : 'rightAlt'
				}
			>
				<FaBatteryFull
					color={
						location.pathname === '/lockScreen'
							? '#d2d2d2'
							: '#000000'
					}
					fill={
						location.pathname === '/lockScreen'
							? '#d2d2d2'
							: '#000000'
					}
				/>
			</div>
		</div>
	);
};

export default TopBar;
