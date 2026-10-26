import React, { useLayoutEffect, useRef, useState } from 'react';
import './notes.css';
import '../../components/MailSheet.css';
import AppHeaderBar from '../../components/AppHeaderBar/AppHeaderBar';
import { playSound } from '../../utils/uiSound';
import { NOTES, COMING_SOON, shortDate, longDate } from './notesData';
import { GROCERY_TITLE, GROCERY_DATE, GROCERY_ITEMS } from './groceryList';

/* iPhone OS Notes: the phone's blue-gray bars and plain rows; a note is a cream legal pad in
   Marker Felt (near-black at night). Opens at the top ("Notes"): the Lyrics folder, a note per
   song, and the Grocery List note. In a lyric note the share button's sheet is the only way out
   to /lyrics/ (Open in Safari) and Spotify. */

const FOLDER = 'Lyrics';
const GROCERY_BODY = GROCERY_ITEMS.join('\n');

const ShareIcon = () => (
	<svg viewBox='0 0 24 24' aria-hidden>
		<path d='M12 3v12M7.5 7.5 12 3l4.5 4.5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
		<path d='M8 10.5H6v10h12v-10h-2' fill='none' stroke='currentColor' strokeWidth='2' strokeLinejoin='round' />
	</svg>
);

const Arrow = ({ left }) => (
	<svg viewBox='0 0 24 24' aria-hidden>
		<path d={left ? 'M15 4 7 12l8 8' : 'm9 4 8 8-8 8'} fill='none' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' />
	</svg>
);

const Notes = () => {
	const [page, setPage] = useState('top'); // top | list | note | grocery
	const [index, setIndex] = useState(0);
	const [dir, setDir] = useState('in'); // in | back – which way the page slides
	const [sheet, setSheet] = useState(false);
	const scrollRef = useRef(null);
	const listScroll = useRef(0);

	const go = (next, d = 'in') => {
		if (page === 'list') listScroll.current = scrollRef.current?.scrollTop ?? 0;
		setDir(d);
		setPage(next);
	};
	const openNote = (i) => {
		playSound('tap');
		setIndex(i);
		go('note');
	};
	const step = (by) => {
		const i = index + by;
		if (i < 0 || i >= NOTES.length) return;
		setDir(by > 0 ? 'in' : 'back');
		setIndex(i);
	};

	// back on the list lands where you were; a new note starts at its top
	useLayoutEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = page === 'list' ? listScroll.current : 0;
	}, [page, index]);

	const note = NOTES[index];
	const header =
		page === 'top'
			? { title: 'Notes' }
			: page === 'list'
				? { title: `${FOLDER} (${NOTES.length})`, backLabel: 'Notes', onBack: () => go('top', 'back') }
				: page === 'grocery'
					? { title: GROCERY_TITLE, backLabel: 'Notes', onBack: () => go('top', 'back') }
					: { title: note.title, backLabel: FOLDER, onBack: () => go('list', 'back') };
	const onPaper = page === 'note' || page === 'grocery';

	return (
		<div className={`notesPage notesPage-${page}${onPaper ? ' notesPage-note' : ''}`}>
			<AppHeaderBar {...header} />
			<div
				ref={scrollRef}
				className={`notesScroll${dir === 'back' ? ' ntBack' : ''}`}
				key={page === 'note' ? `note-${index}` : page}
			>
				{page === 'top' && (
					<ul className='ntRows' aria-label='Notes'>
						<li>
							<button type='button' className='ntRow ntFolder' onClick={() => go('list')}>
								<span className='ntTitle'>{FOLDER}</span>
								<span className='ntCount'>{NOTES.length}</span>
								<span className='ntChevron'>›</span>
							</button>
						</li>
						<li>
							<button
								type='button'
								className='ntRow ntFolder'
								onClick={() => {
									playSound('tap');
									go('grocery');
								}}
							>
								<span className='ntTitle'>{GROCERY_TITLE}</span>
								<span className='ntCount'>{GROCERY_ITEMS.length}</span>
								<span className='ntChevron'>›</span>
							</button>
						</li>
					</ul>
				)}

				{page === 'list' && (
					<ul className='ntRows' aria-label={FOLDER}>
						{NOTES.map((n, i) => (
							<li key={n.id}>
								<button type='button' className='ntRow' onClick={() => openNote(i)}>
									<span className='ntLine1'>
										<span className='ntTitle'>{n.title}</span>
										<span className='ntDate'>{shortDate(n.releaseDate)}</span>
									</span>
									<span className={`ntPreview${n.body === COMING_SOON ? ' ntPending' : ''}`}>{n.preview}</span>
								</button>
							</li>
						))}
					</ul>
				)}

				{page === 'note' && (
					<article className='ntPaper'>
						<p className='ntStamp'>{longDate(note.releaseDate)}</p>
						<h2 className='ntNoteTitle'>{note.title}</h2>
						<p className={`ntBody${note.body === COMING_SOON ? ' ntPending' : ''}`}>{note.body}</p>
					</article>
				)}

				{page === 'grocery' && (
					<article className='ntPaper'>
						<p className='ntStamp'>{longDate(GROCERY_DATE)}</p>
						<h2 className='ntNoteTitle'>{GROCERY_TITLE}</h2>
						<p className='ntBody'>{GROCERY_BODY}</p>
					</article>
				)}
			</div>

			{page === 'note' && (
				<div className='ntToolbar'>
					<button type='button' className='ntTool' onClick={() => step(-1)} disabled={index === 0} aria-label='Previous note'>
						<Arrow left />
					</button>
					<button
						type='button'
						className='ntTool'
						onClick={() => {
							playSound('tap');
							setSheet(true);
						}}
						aria-label='Share'
					>
						<ShareIcon />
					</button>
					<button type='button' className='ntTool' onClick={() => step(1)} disabled={index === NOTES.length - 1} aria-label='Next note'>
						<Arrow />
					</button>
				</div>
			)}

			{sheet && (
				<div className='msScrim' onClick={() => setSheet(false)} role='dialog' aria-label={`Share ${note.title}`}>
					<div className='msSheet' onClick={(e) => e.stopPropagation()}>
						<div className='msTitle'>{note.title}</div>
						<a className='msBtn msBtnPrimary' href={note.spotifyUrl} target='_blank' rel='noopener noreferrer' onClick={() => setSheet(false)}>
							Listen on Spotify
						</a>
						<a className='msBtn' href={note.lyricsUrl} target='_blank' rel='noopener' onClick={() => setSheet(false)}>
							Open in Safari
						</a>
						<button type='button' className='msBtn msBtnCancel' onClick={() => setSheet(false)}>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Notes;
