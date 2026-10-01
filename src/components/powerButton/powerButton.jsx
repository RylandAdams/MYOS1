import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './powerButton.css';
import { playSound } from '../../utils/uiSound';

const PowerButton = () => {
	const [on, setOn] = useState(true);

	const powerToggle = () => {
		playSound('lock');
		if (!on) playSound('boot');
		setOn(!on);
	};

	return (
		<div className='powerBttn'>
			<Link
				className={on ? 'bttn-on' : 'bttn-off'}
				to={on ? '/off' : '/'}
				onClick={powerToggle}
				aria-label='Power'
			>
				<span className='bttnHit' aria-hidden='true' />
			</Link>
		</div>
	);
};

export default PowerButton;
