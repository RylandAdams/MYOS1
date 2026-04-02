import React from 'react';
import './AppHeaderBar.css';

const AppHeaderBar = ({ title, backLabel, onBack }) => (
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
	</div>
);

export default AppHeaderBar;
