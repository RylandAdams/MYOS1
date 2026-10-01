import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import App from '../app';
import { iconFor } from '../../utils/liveIcons';
import './Folder.css';

/* Folder: the whole display frosts over (strong blur + dim) and a glass panel springs out of
   the folder icon itself, with the folder's name above it; closing shrinks it back into the icon. */

const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 };

const Folder = ({ folderName, apps }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [origin, setOrigin] = useState('50% 20%');
	const buttonRef = useRef(null);
	const reduced = useReducedMotion();
	const previewIcons = apps.slice(0, 4);

	useEffect(() => {
		const handleClose = () => setIsOpen(false);
		window.addEventListener('closeFolder', handleClose);
		return () => window.removeEventListener('closeFolder', handleClose);
	}, []);

	useEffect(() => {
		if (!isOpen) return undefined;
		const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen]);

	const open = () => {
		// Grow from the folder icon: its centre, relative to the panel's box
		const screen = document.querySelector('.iphoneContent');
		const b = buttonRef.current?.getBoundingClientRect();
		const s = screen?.getBoundingClientRect();
		if (b && s) {
			const zoom = s.width / (screen.offsetWidth || s.width);
			const x = (b.left + b.width / 2 - s.left) / zoom;
			const y = (b.top + 28 - s.top) / zoom;
			const panelLeft = 14;
			const panelTop = screen.offsetHeight * 0.17;
			setOrigin(`${Math.round(x - panelLeft)}px ${Math.round(y - panelTop)}px`);
		}
		setIsOpen(true);
	};

	const overlayContent = (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="folderOverlay"
					className="folderOverlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: reduced ? 0 : 0.28, ease: [0.25, 0.1, 0.25, 1] }}
					onClick={() => setIsOpen(false)}
					role="dialog"
					aria-label={`${folderName} folder`}
				>
					<motion.div
						className="folderSheet"
						style={{ transformOrigin: origin }}
						initial={reduced ? false : { scale: 0.16, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={reduced ? { opacity: 0 } : { scale: 0.16, opacity: 0, transition: { duration: 0.24, ease: [0.4, 0, 0.6, 1] } }}
						transition={reduced ? { duration: 0 } : { ...SPRING, opacity: { duration: 0.14 } }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="folderTitle">{folderName}</div>
						<div className="folderContent">
							<div className="folderApps">
								{apps.map((app) => (
									<App data={app} key={app.id} />
								))}
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	// Portal into the screen itself so the frost covers the entire display
	const portalTarget = document.querySelector('.iphoneContent') || document.querySelector('.homeScreenWrapper') || document.body;

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className="folderButton Apps"
				onClick={open}
				aria-label={`Open ${folderName} folder`}
			>
				<div className="folderPreview">
					<div className="folderPreviewGrid">
						{previewIcons.map((app, i) => (
							<div key={app.id} className="folderPreviewIcon" style={{ '--i': i }}>
								<img src={iconFor(app)} alt="" loading="lazy" />
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
