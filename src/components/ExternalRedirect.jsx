import React, { useEffect } from 'react';
import { MAINAPPS, FOOTERAPPS } from '../assets/apps';
import { openInApp } from '../utils/openApp';

/**
 * /spotify, /apple, /youtube, /soundcloud: send the visitor to the real app or page
 * (same link as the home-screen icon, opened in the native app when possible).
 */
const ExternalRedirect = ({ appName }) => {
	const app = [...MAINAPPS, ...FOOTERAPPS].find((a) => a.appName === appName);
	const url = app?.url;

	useEffect(() => {
		if (!url) return;
		if (!openInApp(url)) window.location.replace(url);
	}, [url]);

	return (
		<div
			style={{
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#000',
				color: '#fff',
				fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
				fontSize: 14,
				fontWeight: 600,
			}}
		>
			{url ? (
				<a href={url} style={{ color: '#fff', textDecoration: 'none' }}>
					Opening {appName}…
				</a>
			) : (
				`${appName} isn't available`
			)}
		</div>
	);
};

export default ExternalRedirect;
