import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import App from '../app';
import './Folder.css';

const Folder = ({ folderName, apps }) => {
	const [isOpen, setIsOpen] = useState(false);
	const previewIcons = apps.slice(0, 4);

	useEffect(() => {
		const handleClose = () => setIsOpen(false);
		window.addEventListener('closeFolder', handleClose);
		return () => window.removeEventListener('closeFolder', handleClose);
	}, []);

	const overlayContent = (
		<AnimatePresence mode="wait">
			{isOpen && (
				<motion.div
					key="folderOverlay"
					className="folderOverlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{
						opacity: 0,
						transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
					}}
					transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
					onClick={() => setIsOpen(false)}
				>
					<motion.div
						className="folderContent"
						style={{ transformOrigin: 'top left' }}
						initial={{ scale: 0.3, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.3, opacity: 0 }}
						transition={{
							duration: 0.25,
							ease: [0.25, 0.46, 0.45, 0.94],
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="folderApps">
							{apps.map((app) => (
								<App data={app} key={app.id} />
							))}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	const portalTarget = document.querySelector('.homeScreenWrapper') || document.body;

	return (
		<>
			<button
				type="button"
				className="folderButton Apps"
				onClick={() => setIsOpen(true)}
				aria-label={`Open ${folderName} folder`}
			>
				<div className="folderPreview">
					<div className="folderPreviewGrid">
						{previewIcons.map((app, i) => (
							<div key={app.id} className="folderPreviewIcon" style={{ '--i': i }}>
								<img src={app.appImage} alt="" loading="lazy" />
							</div>
						))}
					</div>
					<div className="folderPreviewBg" />
				</div>
				<div className="appName">{folderName}</div>
			</button>

			{createPortal(overlayContent, portalTarget)}
		</>
	);
};

export default Folder;
