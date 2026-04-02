import React from 'react';
import { motion } from 'framer-motion';

/**
 * Smooth fade-in for app pages – avoids jarring "pop in" when navigating.
 */
const PageTransition = ({ children }) => (
	<motion.div
		initial={{ opacity: 0.92 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0.96 }}
		transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
		style={{ height: '100%', minHeight: '100%', willChange: 'opacity' }}
	>
		{children}
	</motion.div>
);

export default PageTransition;
