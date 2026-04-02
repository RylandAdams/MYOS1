import React from 'react';

/**
 * Custom battery icon with black outline (#000) - avoids react-icons color inheritance.
 * Structure matches IoBatteryFullOutline: outer rect, inner rect (fill), path (cap).
 */
const BatteryIcon = ({ fillColor = '#34C759', strokeColor = '#000000', className = '' }) => (
	<svg
		className={className}
		viewBox="0 0 512 512"
		width="26"
		height="15"
		style={{ flexShrink: 0 }}
	>
		{/* Outer battery outline */}
		<rect
			width="400"
			height="224"
			x="32"
			y="144"
			fill="none"
			stroke={strokeColor}
			strokeWidth="32"
			strokeLinecap="square"
			strokeMiterlimit="10"
			rx="45.7"
			ry="45.7"
		/>
		{/* Inner fill */}
		<rect
			width="292.63"
			height="114.14"
			x="85.69"
			y="198.93"
			fill={fillColor}
			stroke={strokeColor}
			strokeWidth="16"
			strokeLinecap="square"
			strokeMiterlimit="10"
			rx="4"
			ry="4"
		/>
		{/* Battery cap */}
		<path
			fill="none"
			stroke={strokeColor}
			strokeWidth="32"
			strokeLinecap="round"
			strokeMiterlimit="10"
			d="M480 218.67v74.66"
		/>
	</svg>
);

export default BatteryIcon;
