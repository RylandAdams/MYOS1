import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLock } from '../context/LockContext';
import './ScreenOff.css';

/* The display switched off: the whole screen (status bar included) drops to the soft dark gray of
   unlit glass in a quick dim, like the original. The glass film and glare stay on top. */
const ScreenOff = () => {
	const { off } = useLock();
	return (
		<AnimatePresence>
			{off && (
				<motion.div
					key="screenOff"
					className="screenOff"
					aria-label="Screen off"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
					exit={{ opacity: 0, transition: { duration: 0.7, ease: [0, 0, 0.2, 1] } }}
				/>
			)}
		</AnimatePresence>
	);
};

export default ScreenOff;
