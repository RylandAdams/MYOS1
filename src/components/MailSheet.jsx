import React, { useEffect, useState } from 'react';
import './MailSheet.css';

/* iPhone OS action sheet for "Email Me". In-app browsers (Instagram, TikTok…) usually ignore
   mailto: links, so the address is shown with Copy Address / Open Mail / Cancel instead.
   Open with: window.dispatchEvent(new CustomEvent('myos:mail', { detail: 'name@example.com' })) */
const MailSheet = () => {
	const [address, setAddress] = useState(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const open = (e) => {
			setCopied(false);
			setAddress(e.detail);
		};
		window.addEventListener('myos:mail', open);
		return () => window.removeEventListener('myos:mail', open);
	}, []);

	useEffect(() => {
		if (!address) return undefined;
		const onKey = (e) => e.key === 'Escape' && setAddress(null);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [address]);

	if (!address) return null;

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(address);
		} catch {
			const t = document.createElement('textarea');
			t.value = address;
			document.body.appendChild(t);
			t.select();
			try {
				document.execCommand('copy');
			} catch {}
			t.remove();
		}
		setCopied(true);
		setTimeout(() => setAddress(null), 900);
	};

	return (
		<div className="msScrim" onClick={() => setAddress(null)} role="dialog" aria-label="Email RYLAND">
			<div className="msSheet" onClick={(e) => e.stopPropagation()}>
				<div className="msTitle">{address}</div>
				<button type="button" className="msBtn msBtnPrimary" onClick={copy}>
					{copied ? 'Copied' : 'Copy Address'}
				</button>
				<a className="msBtn" href={`mailto:${address}`} onClick={() => setAddress(null)}>
					Open Mail
				</a>
				<button type="button" className="msBtn msBtnCancel" onClick={() => setAddress(null)}>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default MailSheet;
