import React from 'react';
import './AppHeaderBar.css';

const AppHeaderBar = ({ title, backLabel, onBack, actionLabel, onAction }) => (
	<div className="appHeaderBar">
		{backLabel && onBack ? (
			<button
				type="button"
				className="appHeaderBackBtn"
				onClick={onBack}
			>
				<span className="appHeaderBackLabel">{backLabel}</span>
			</button>
		) : null}
		<h1 className="appHeaderTitle">{title}</h1>
		{actionLabel && onAction ? (
			<button
				type="button"
				className="appHeaderActionBtn"
				onClick={onAction}
			>
				<span className="appHeaderBackLabel">{actionLabel}</span>
			</button>
		) : null}
	</div>
);

export default AppHeaderBar;
