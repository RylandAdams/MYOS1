import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './powerButton.css';

const PowerButton = () => {
	const [on, setOn] = useState(true);

	const powerToggle = () => {
		setOn(!on);
		console.log(on);
	};

	return (
		<div className='powerBttn'>
			<Link
				className={on ? 'bttn-on' : 'bttn-off'}
				to={on ? '/off' : '/'}
				onClick={powerToggle}
			>
				POWER
			</Link>
		</div>
	);
};

export default PowerButton;
