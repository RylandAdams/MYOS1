import React from 'react';
import { motion } from 'framer-motion';
import './PageFallback.css';

/**
 * Elegant loading state while lazy-loaded app chunks load.
 * Matches the light gray gradient of Photos, iPod, Calendar – feels intentional, not broken.
 */
const PageFallback = () => (
	<motion.div
		className="pageFallback"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 0.2 }}
	/>
);

export default PageFallback;
