import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import './slideToUnlock.css';

const SlideToUnlock = () => {
	const navigate = useNavigate();

	const sliderRef = useRef(null);
	const arrowRef = useRef(null);
	const wellRef = useRef(null);

	const toHomeScreen = () => {
		navigate('/homeScreen');
	};

	useEffect(() => {
		const slider = sliderRef.current;
		const arrow = arrowRef.current;
		const well = wellRef.current;

		let startX = 0;
		let startTranslateX = 0;
		let isDragging = false;

		const handleDragStart = (event) => {
			if (event.touches) {
				startX = event.touches[0].clientX;
			} else {
				startX = event.clientX;
			}
			startTranslateX = getTranslateX();
			isDragging = true;
		};

		const handleDragMove = (event) => {
			if (!isDragging) return;
			event.preventDefault();

			let clientX;
			if (event.touches) {
				clientX = event.touches[0].clientX;
			} else {
				clientX = event.clientX;
			}

			const diffX = clientX - startX;
			const newTranslateX = startTranslateX + diffX;
			setTranslateX(newTranslateX);
		};

		const handleDragEnd = () => {
			isDragging = false;
			const translateX = getTranslateX();
			if (translateX > 150) {
				console.log('DONE');
				toHomeScreen();
				well.style.display = 'none';
			} else {
				setTranslateX(0);
			}
		};

		const getTranslateX = () => {
			const transformValue = slider.style.transform;
			if (!transformValue) return 0;
			const match = transformValue.match(/translateX\((.*?)px\)/);
			if (!match || !match[1]) return 0;
			return parseInt(match[1], 10);
		};

		const setTranslateX = (translateX) => {
			slider.style.transform = `translateX(${translateX}px)`;
			arrow.style.transform = `translateX(${translateX}px)`;
		};

		// Add event listeners for touch events
		slider.addEventListener('mousedown', handleDragStart);
		slider.addEventListener('touchstart', handleDragStart);

		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('touchmove', handleDragMove);

		document.addEventListener('mouseup', handleDragEnd);
		document.addEventListener('touchend', handleDragEnd);

		return () => {
			// Clean up the event listeners
			slider.removeEventListener('mousedown', handleDragStart);
			slider.removeEventListener('touchstart', handleDragStart);

			document.removeEventListener('mousemove', handleDragMove);
			document.removeEventListener('touchmove', handleDragMove);

			document.removeEventListener('mouseup', handleDragEnd);
			document.removeEventListener('touchend', handleDragEnd);
		};
	}, []);

	return (
		<div id='page-wrap'>
			<div
				id='well'
				ref={wellRef}
			>
				<div className='h2'>
					<strong
						id='slider'
						ref={sliderRef}
					></strong>
					<span>slide to unlock</span>
				</div>
				<div
					className='arrow'
					ref={arrowRef}
				></div>
			</div>
		</div>
	);
};

export default SlideToUnlock;
