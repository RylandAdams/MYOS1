import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { isInAppBrowser, purgeInAppBrowserStorage } from './utils/inAppBrowser';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

if (process.env.NODE_ENV === 'production') {
	if (isInAppBrowser()) {
		purgeInAppBrowserStorage().catch(() => {});
	} else if ('serviceWorker' in navigator) {
		let refreshing = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (refreshing) return;
			refreshing = true;
			window.location.reload();
		});

		window.addEventListener('load', () => {
			navigator.serviceWorker
				.register('/sw.js')
				.then((reg) => {
					reg.update();
					if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
				})
				.catch(() => {});
		});
	}
}
