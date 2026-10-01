import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Apps zoom open from the middle of the screen, like the original iPhone.
 * Falls back to a plain fade when the visitor prefers reduced motion.
 */
const PageTransition = ({ children }) => {
	const reduced = useReducedMotion();
	return (
	<motion.div
		initial={reduced ? { opacity: 0.92 } : { opacity: 0, scale: 0.86 }}
		animate={{ opacity: 1, scale: 1 }}
		exit={{ opacity: 0.96 }}
		transition={{ duration: reduced ? 0.2 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
		style={{ height: '100%', minHeight: '100%', willChange: 'opacity, transform', transformOrigin: '50% 45%' }}
	>
		{children}
	</motion.div>
	);
};

export default PageTransition;
