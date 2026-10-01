import { useEffect } from 'react';

/** While a full-screen black view is open, the phone status bar turns black (see topBar.css) */
export function useDarkStatusBar() {
	useEffect(() => {
		const screen = document.querySelector('.iphoneContent');
		screen?.classList.add('statusDark');
		return () => screen?.classList.remove('statusDark');
	}, []);
}
