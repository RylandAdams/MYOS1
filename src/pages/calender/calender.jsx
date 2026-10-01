import React, { useState } from 'react';
import './calender.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';

/* iPhone OS Calendar month view: ◀ Month Year ▶, Sunday-first grid of gray tiles,
   blue selected day, a dot on days with something on them, and that day's list below.
   The last Friday of each month carries the "?" mark. */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function lastFridayOf(year, month) {
	const last = new Date(year, month + 1, 0);
	const back = (last.getDay() - 5 + 7) % 7;
	return last.getDate() - back;
}

const Calender = () => {
	const now = new Date();
	const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
	const [selected, setSelected] = useState(now.getDate());

	const { year, month } = view;
	const isThisMonth = year === now.getFullYear() && month === now.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const lead = new Date(year, month, 1).getDay();
	const mark = lastFridayOf(year, month);
	const prevDays = new Date(year, month, 0).getDate();

	const cells = [];
	for (let i = lead - 1; i >= 0; i--) cells.push({ day: prevDays - i, outside: true });
	for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
	for (let d = 1; cells.length % 7; d++) cells.push({ day: d, outside: true });

	const shift = (step) => {
		const d = new Date(year, month + step, 1);
		setView({ year: d.getFullYear(), month: d.getMonth() });
		setSelected(1);
	};

	const selectedDate = new Date(year, month, Math.min(selected, daysInMonth));

	return (
		<div className="calenderPage">
			<AppHeaderBar title="Calendar" />
			<div className="calBody">
				<div className="calMonthBar">
					<button type="button" className="calArrow" onClick={() => shift(-1)} aria-label="Previous month">
						<span className="calTriLeft" />
					</button>
					<span className="calMonthTitle">
						{MONTHS[month]} {year}
					</span>
					<button type="button" className="calArrow" onClick={() => shift(1)} aria-label="Next month">
						<span className="calTriRight" />
					</button>
				</div>
				<div className="calWeekdays">
					{WEEKDAYS.map((d) => (
						<span key={d}>{d}</span>
					))}
				</div>
				<div className="calGrid">
					{cells.map((c, i) => {
						const isToday = !c.outside && isThisMonth && c.day === now.getDate();
						const isSel = !c.outside && c.day === selected;
						const hasMark = !c.outside && c.day === mark;
						return (
							<button
								type="button"
								key={i}
								disabled={c.outside}
								className={`calCell${c.outside ? ' calOutside' : ''}${isToday ? ' calToday' : ''}${isSel ? ' calSel' : ''}`}
								onClick={() => setSelected(c.day)}
								aria-label={c.outside ? undefined : `${MONTHS[month]} ${c.day}${hasMark ? ', ?' : ''}`}
							>
								<span className="calNum">{c.day}</span>
								{hasMark && <span className="calDot" />}
							</button>
						);
					})}
				</div>
				<div className="calEvents">
					<div className="calEventsDate">
						{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
					</div>
					{selected === mark ? (
						<div className="calEvent">
							<span className="calEventTime">all-day</span>
							<span className="calEventTitle">?</span>
						</div>
					) : (
						<div className="calNoEvents">No Events</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Calender;
