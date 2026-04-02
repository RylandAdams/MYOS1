import React from 'react';
import './calender.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getLastFridayOfMonth(year, month) {
	const lastDay = new Date(year, month + 1, 0);
	for (let d = lastDay.getDate(); d >= 1; d--) {
		const date = new Date(year, month, d);
		if (date.getDay() === 5) return d;
	}
	return null;
}

const Calender = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const today = now.getDate();
	const lastFriday = getLastFridayOfMonth(year, month);

	const firstDay = new Date(year, month, 1);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const startOffset = (firstDay.getDay() + 6) % 7;

	const gridCells = [];
	for (let i = 0; i < startOffset; i++) gridCells.push(null);
	for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);

	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'];
	const monthName = monthNames[month];

	return (
		<div className="calenderPage">
			<AppHeaderBar title="Calender" />
			<div className="calenderBody">
				<div className="calenderMonth">{monthName} {year}</div>
				<div className="calenderWeekdays">
					{WEEKDAYS.map((d) => (
						<div key={d} className="calenderWeekday">{d}</div>
					))}
				</div>
				<div className="calenderGrid">
					{gridCells.map((day, i) => (
						<div
							key={i}
							className={`calenderCell ${day === null ? 'empty' : ''} ${day === today ? 'today' : ''} ${day === lastFriday ? 'lastFriday' : ''}`}
						>
							{day !== null && (
								<>
									<span className="calenderDayNum">{day}</span>
									{day === lastFriday && (
										<span className="calenderQuestion">?</span>
									)}
								</>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Calender;
