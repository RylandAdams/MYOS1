import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './topBar.css';

import { GiNetworkBars } from 'react-icons/gi';
import { FaBatteryFull, FaLock } from 'react-icons/fa';

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
				location.pathname === '/homeScreen' ? 'topBar' : 'topBarAlt'
			}
		>
			<div
				className={
					location.pathname === '/homeScreen' ? 'left' : 'leftAlt'
				}
			>
				RYLAND
				<GiNetworkBars
					color={
						location.pathname === '/homeScreen'
							? '#d2d2d2'
							: '#000000'
					}
					fill={
						location.pathname === '/homeScreen'
							? '#d2d2d2'
							: '#000000'
					}
					className={
						location.pathname === '/homeScreen'
							? 'cellularBars'
							: 'cellularBarsAlt'
					}
				/>
			</div>
			<div className='topMid'>
				{location.pathname === '/' ? (
					<FaLock
						color='#000000'
						fill='#454545'
						className='lockIcon'
					/>
				) : (
					<div
						className={
							location.pathname === '/homeScreen'
								? 'clock'
								: 'clockAlt'
						}
					>
						{date.toLocaleTimeString([], {
							hour: 'numeric',
							minute: '2-digit',
						})}
					</div>
				)}
			</div>

			<div
				className={
					location.pathname === '/homeScreen' ? 'right' : 'rightAlt'
				}
			>
				<FaBatteryFull
					color={
						location.pathname === '/homeScreen'
							? '#d2d2d2'
							: '#000000'
					}
					fill={
						location.pathname === '/homeScreen'
							? '#d2d2d2'
							: '#000000'
					}
				/>
			</div>
		</div>
	);
};

export default TopBar;
