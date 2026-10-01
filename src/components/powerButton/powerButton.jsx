import React from 'react';

import './powerButton.css';
import { playSound } from '../../utils/uiSound';
import { useLock } from '../../context/LockContext';

/* Sleep/wake: switches the display off and on in place (no page change); waking shows the lock screen */
const PowerButton = () => {
	const { off, togglePower } = useLock();

	const press = () => {
		playSound('lock');
		if (off) playSound('boot');
		togglePower();
	};

	return (
		<div className='powerBttn'>
			<button type='button' className={off ? 'bttn-off' : 'bttn-on'} onClick={press} aria-label={off ? 'Turn on' : 'Turn off'}>
				<span className='bttnHit' aria-hidden='true' />
			</button>
		</div>
	);
};

export default PowerButton;
