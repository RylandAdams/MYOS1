import React, { useEffect, useRef } from 'react';
import './flappyBird.css';

/* Classic palette, redrawn in code (no original sprite files) */
const C = {
	sky: '#4ec0ca',
	cloud: '#e9fcd9',
	city: '#bfe6c6',
	cityWindow: '#a3d9b1',
	bush: '#5ee270',
	bushEdge: '#4bc25c',
	outline: '#543847',
	green: '#73bf2e',
	greenLight: '#9ce659',
	greenDark: '#558022',
	sand: '#ded895',
	sandDark: '#d0c874',
	birdBody: '#f8b733',
	birdLight: '#fbe08a',
	birdWing: '#fff4c4',
	beak: '#f7712b',
	beakDark: '#d8461b',
	orange: '#f6a03b',
	labelOrange: '#e86101',
};

/* World units: the game is laid out on a 288-wide field, height follows the screen */
const W = 288;
const GRAVITY = 0.25; // per frame² at 60fps
const FLAP = -4.6;
const MAX_FALL = 8;
const SPEED = 2;
const PIPE_W = 48;
const LIP_W = 52;
const LIP_H = 24;
const GAP = 100;
const SPACING = 160;
const GROUND_H = 64;
const BIRD_X = 80;
const BIRD_R = 11;
const BIRD_PX = 1.7; // world units per sprite pixel
const BEST_KEY = 'myos-flappy-best';

const DIGITS = {
	0: [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
	1: ['  #  ', ' ##  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
	2: [' ### ', '#   #', '    #', '   # ', '  #  ', ' #   ', '#####'],
	3: [' ### ', '#   #', '    #', '  ## ', '    #', '#   #', ' ### '],
	4: ['   # ', '  ## ', ' # # ', '#  # ', '#####', '   # ', '   # '],
	5: ['#####', '#    ', '#### ', '    #', '    #', '#   #', ' ### '],
	6: [' ### ', '#    ', '#    ', '#### ', '#   #', '#   #', ' ### '],
	7: ['#####', '    #', '   # ', '  #  ', '  #  ', '  #  ', '  #  '],
	8: [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
	9: [' ### ', '#   #', '#   #', ' ####', '    #', '    #', ' ### '],
};

const MEDALS = [
	{ min: 40, color: '#e5e4e2', rim: '#b9b8b5' },
	{ min: 30, color: '#f7d34a', rim: '#c9a227' },
	{ min: 20, color: '#d6d6d6', rim: '#a5a5a5' },
	{ min: 10, color: '#d48a4c', rim: '#a3632f' },
];

const readBest = () => {
	try {
		return Number(localStorage.getItem(BEST_KEY)) || 0;
	} catch {
		return 0;
	}
};

const writeBest = (n) => {
	try {
		localStorage.setItem(BEST_KEY, String(n));
	} catch {}
};

/* Deterministic random so the skyline looks the same every visit */
const seeded = (seed) => () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

const circleHitsRect = (cx, cy, r, x, y, w, h) => {
	const nx = Math.max(x, Math.min(cx, x + w));
	const ny = Math.max(y, Math.min(cy, y + h));
	return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
};

/* Pixel-art bird built cell by cell, outlined automatically */
const makeBird = (wingOffset) => {
	const w = 20;
	const h = 15;
	const grid = Array.from({ length: h }, () => Array(w).fill(null));
	const inEllipse = (x, y, cx, cy, rx, ry) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
	const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && grid[y][x] && grid[y][x] !== C.outline;

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (inEllipse(x, y, 9, 7.5, 7.6, 6.2)) grid[y][x] = y < 5 && x < 9 ? C.birdLight : C.birdBody;
			if (inEllipse(x, y, 8, 11.5, 5, 2.2) && grid[y][x]) grid[y][x] = C.birdLight;
		}
	}
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (inEllipse(x, y, 4.5, 7.5 + wingOffset, 4.2, 2.6)) {
				const edge = !inEllipse(x - 1, y, 4.5, 7.5 + wingOffset, 4.2, 2.6) ||
					!inEllipse(x + 1, y, 4.5, 7.5 + wingOffset, 4.2, 2.6) ||
					!inEllipse(x, y - 1, 4.5, 7.5 + wingOffset, 4.2, 2.6) ||
					!inEllipse(x, y + 1, 4.5, 7.5 + wingOffset, 4.2, 2.6);
				grid[y][x] = edge ? C.outline : C.birdWing;
			}
			if (inEllipse(x, y, 12.5, 4.5, 3.2, 3.2)) grid[y][x] = '#ffffff';
		}
	}
	grid[4][13] = C.outline;
	grid[5][13] = C.outline;
	grid[4][14] = C.outline;
	grid[5][14] = C.outline;
	for (let x = 11; x <= 18; x++) {
		grid[8][x] = C.beak;
		grid[9][x] = C.beak;
		if (x <= 17) grid[10][x] = C.beakDark;
		if (x <= 16) grid[11][x] = C.beakDark;
	}

	const out = grid.map((row) => row.slice());
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (grid[y][x]) continue;
			if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) out[y][x] = C.outline;
		}
	}
	for (let x = 11; x <= 18; x++) out[10][x] = out[10][x] === C.beakDark ? C.outline : out[10][x];

	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	const g = c.getContext('2d');
	out.forEach((row, y) =>
		row.forEach((color, x) => {
			if (!color) return;
			g.fillStyle = color;
			g.fillRect(x, y, 1, 1);
		})
	);
	return c;
};

/* 5x7 white digit with a 1px black outline, as a tiny sprite */
const makeDigit = (d) => {
	const rows = DIGITS[d];
	const c = document.createElement('canvas');
	c.width = 7;
	c.height = 9;
	const g = c.getContext('2d');
	const on = (x, y) => rows[y] && rows[y][x] === '#';
	for (let y = -1; y <= 7; y++) {
		for (let x = -1; x <= 5; x++) {
			const enclosed = rows[y] && rows[y].indexOf('#') < x && rows[y].lastIndexOf('#') > x;
			if (on(x, y)) g.fillStyle = '#ffffff';
			else if (enclosed) g.fillStyle = '#000000';
			else if ([[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].some(([dx, dy]) => on(x + dx, y + dy))) g.fillStyle = '#000000';
			else continue;
			g.fillRect(x + 1, y + 1, 1, 1);
		}
	}
	return c;
};

const Flappybird = () => {
	const wrapRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const birdFrames = [makeBird(-1.5), makeBird(0), makeBird(1.5), makeBird(0)];
		const digitSprites = Object.fromEntries(Object.keys(DIGITS).map((d) => [d, makeDigit(d)]));

		let H = 512;
		let dpr = 1;
		let scale = 1;
		let backdrop = null;
		let raf = 0;
		let last = performance.now();

		const s = {
			mode: 'ready', // ready | playing | dying | over
			y: 0,
			vy: 0,
			t: 0,
			pipes: [],
			score: 0,
			best: readBest(),
			newBest: false,
			groundX: 0,
			flash: 0,
			overAt: 0,
		};

		const buildBackdrop = () => {
			const rand = seeded(2013);
			const floor = H - GROUND_H;
			const c = document.createElement('canvas');
			c.width = Math.max(1, Math.round(W * scale * dpr));
			c.height = Math.max(1, Math.round(H * scale * dpr));
			const g = c.getContext('2d');
			g.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);

			g.fillStyle = C.sky;
			g.fillRect(0, 0, W, H);

			const cloudY = floor - 92;
			g.fillStyle = C.cloud;
			for (let x = -10; x < W + 20; x += 18 + rand() * 10) {
				g.beginPath();
				g.arc(x, cloudY + rand() * 8, 13 + rand() * 9, 0, Math.PI * 2);
				g.fill();
			}
			g.fillRect(0, cloudY, W, floor - cloudY);

			let x = 0;
			while (x < W) {
				const bw = 14 + Math.floor(rand() * 16);
				const bh = 22 + Math.floor(rand() * 36);
				const top = floor - 24 - bh;
				g.fillStyle = C.city;
				g.fillRect(x, top, bw, bh + 24);
				g.fillStyle = C.cityWindow;
				for (let wy = top + 4; wy < floor - 26; wy += 6) {
					for (let wx = x + 3; wx < x + bw - 3; wx += 5) g.fillRect(wx, wy, 2, 3);
				}
				x += bw + Math.floor(rand() * 3);
			}

			const bushY = floor - 20;
			for (let pass = 0; pass < 2; pass++) {
				const r2 = seeded(7);
				g.fillStyle = pass === 0 ? C.bushEdge : C.bush;
				for (let bx = -6; bx < W + 16; bx += 14 + r2() * 8) {
					g.beginPath();
					g.arc(bx, bushY + r2() * 4, (9 + r2() * 6) - pass, 0, Math.PI * 2);
					g.fill();
				}
			}
			g.fillStyle = C.bush;
			g.fillRect(0, bushY, W, floor - bushY);

			backdrop = c;
		};

		const resize = () => {
			// Layout size, not the on-screen rect: the app opens with a zoom transform
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			if (!w || !h) return;
			const frameScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1;
			dpr = Math.min((window.devicePixelRatio || 1) * frameScale, 3);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			scale = w / W;
			H = h / scale;
			buildBackdrop();
			if (s.mode === 'ready') s.y = H * 0.42;
		};

		const reset = () => {
			s.mode = 'ready';
			s.y = H * 0.42;
			s.vy = 0;
			s.t = 0;
			s.pipes = [];
			s.score = 0;
			s.newBest = false;
		};

		const spawnPipe = (x) => {
			const minY = 60;
			const maxY = H - GROUND_H - GAP - 60;
			s.pipes.push({ x, gapY: minY + Math.random() * Math.max(0, maxY - minY), passed: false });
		};

		const die = () => {
			s.mode = 'dying';
			s.flash = 1;
			s.vy = Math.min(s.vy, 0);
			if (s.score > s.best) {
				s.best = s.score;
				s.newBest = true;
				writeBest(s.best);
			}
		};

		const land = () => {
			s.y = H - GROUND_H - BIRD_R;
			s.mode = 'over';
			s.overAt = performance.now();
		};

		const flap = () => {
			if (s.mode === 'ready') {
				s.mode = 'playing';
				s.pipes = [];
				s.score = 0;
				spawnPipe(W + 60);
				s.vy = FLAP;
			} else if (s.mode === 'playing') {
				s.vy = FLAP;
			} else if (s.mode === 'over' && performance.now() - s.overAt > 600) {
				reset();
			}
		};

		const hitsPipe = (p) => {
			const floor = H - GROUND_H;
			const bottomY = p.gapY + GAP;
			const lipX = p.x - (LIP_W - PIPE_W) / 2;
			const r = BIRD_R - 1;
			return (
				circleHitsRect(BIRD_X, s.y, r, p.x, -200, PIPE_W, p.gapY + 200) ||
				circleHitsRect(BIRD_X, s.y, r, lipX, p.gapY - LIP_H, LIP_W, LIP_H) ||
				circleHitsRect(BIRD_X, s.y, r, p.x, bottomY, PIPE_W, floor - bottomY) ||
				circleHitsRect(BIRD_X, s.y, r, lipX, bottomY, LIP_W, LIP_H)
			);
		};

		const update = (dt) => {
			const floor = H - GROUND_H;
			s.t += dt;
			s.flash = Math.max(0, s.flash - 0.07 * dt);

			if (s.mode === 'ready' || s.mode === 'playing') s.groundX = (s.groundX + SPEED * dt) % 14;

			if (s.mode === 'ready') {
				s.y = H * 0.42 + Math.sin(s.t * 0.12) * 4;
				return;
			}

			if (s.mode === 'playing') {
				s.vy = Math.min(s.vy + GRAVITY * dt, MAX_FALL);
				s.y = Math.max(-BIRD_R * 2, s.y + s.vy * dt);

				for (const p of s.pipes) {
					p.x -= SPEED * dt;
					if (!p.passed && p.x + PIPE_W / 2 < BIRD_X) {
						p.passed = true;
						s.score += 1;
					}
				}
				s.pipes = s.pipes.filter((p) => p.x > -LIP_W);
				const lastPipe = s.pipes[s.pipes.length - 1];
				if (!lastPipe || lastPipe.x < W - SPACING) spawnPipe((lastPipe ? lastPipe.x : W) + SPACING);

				if (s.y + BIRD_R >= floor) {
					die();
					land();
				} else if (s.pipes.some(hitsPipe)) {
					die();
				}
				return;
			}

			if (s.mode === 'dying') {
				s.vy = Math.min(s.vy + GRAVITY * 1.4 * dt, MAX_FALL * 1.3);
				s.y += s.vy * dt;
				if (s.y + BIRD_R >= floor) land();
			}
		};

		const column = (x, y, w, h, isLip) => {
			ctx.fillStyle = C.outline;
			ctx.fillRect(x, y, w, h);
			const ix = x + 1.5;
			const iw = w - 3;
			const iy = isLip ? y + 1.5 : y;
			const ih = isLip ? h - 3 : h;
			ctx.fillStyle = C.green;
			ctx.fillRect(ix, iy, iw, ih);
			ctx.fillStyle = C.greenLight;
			ctx.fillRect(ix + 3, iy, 5, ih);
			ctx.fillRect(ix + 10, iy, 2, ih);
			ctx.fillStyle = C.greenDark;
			ctx.fillRect(ix + iw - 7, iy, 4, ih);
			ctx.fillRect(ix + iw - 2, iy, 2, ih);
			if (isLip) {
				ctx.fillStyle = C.greenDark;
				ctx.fillRect(ix, iy + ih - 3, iw, 3);
			}
		};

		const drawPipe = (p) => {
			const floor = H - GROUND_H;
			const bottomY = p.gapY + GAP;
			const lipX = p.x - (LIP_W - PIPE_W) / 2;
			column(p.x, -2, PIPE_W, p.gapY - LIP_H + 2, false);
			column(lipX, p.gapY - LIP_H, LIP_W, LIP_H, true);
			column(p.x, bottomY + LIP_H, PIPE_W, floor - bottomY - LIP_H, false);
			column(lipX, bottomY, LIP_W, LIP_H, true);
		};

		const drawGround = () => {
			const floor = H - GROUND_H;
			ctx.fillStyle = C.outline;
			ctx.fillRect(0, floor, W, 2);
			ctx.fillStyle = C.green;
			ctx.fillRect(0, floor + 2, W, 11);
			ctx.fillStyle = C.greenLight;
			for (let x = -s.groundX - 14; x < W + 14; x += 14) {
				ctx.beginPath();
				ctx.moveTo(x, floor + 13);
				ctx.lineTo(x + 7, floor + 2);
				ctx.lineTo(x + 14, floor + 2);
				ctx.lineTo(x + 7, floor + 13);
				ctx.closePath();
				ctx.fill();
			}
			ctx.fillStyle = C.greenDark;
			ctx.fillRect(0, floor + 13, W, 3);
			ctx.fillStyle = C.sand;
			ctx.fillRect(0, floor + 16, W, GROUND_H - 16);
			ctx.fillStyle = C.sandDark;
			ctx.fillRect(0, floor + 16, W, 2);
		};

		const drawBird = () => {
			let angle = 0;
			if (s.mode === 'over') angle = Math.PI / 2;
			else if (s.mode === 'playing' || s.mode === 'dying') angle = Math.max(-0.4, Math.min(Math.PI / 2, (s.vy - 2) * 0.16));

			const flapping = s.mode === 'ready' || s.mode === 'playing';
			const rate = s.mode === 'playing' && s.vy > 3 ? 0 : 0.25;
			const frame = flapping && rate ? birdFrames[Math.floor(s.t * rate) % 4] : birdFrames[1];
			const bw = frame.width * BIRD_PX;
			const bh = frame.height * BIRD_PX;

			ctx.save();
			ctx.translate(BIRD_X, s.y);
			ctx.rotate(angle);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(frame, -bw / 2, -bh / 2, bw, bh);
			ctx.restore();
		};

		const digitsWidth = (str, px) => str.length * 6 * px + px;

		const drawNumber = (n, x, y, px, align = 'center') => {
			const str = String(n);
			const total = digitsWidth(str, px);
			const left = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
			ctx.imageSmoothingEnabled = false;
			[...str].forEach((d, i) => {
				const glyph = digitSprites[d];
				ctx.drawImage(glyph, left + i * 6 * px, y - px, glyph.width * px, glyph.height * px);
			});
		};

		const title = (str, x, y, size, fill) => {
			ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = C.outline;
			ctx.lineWidth = size * 0.36;
			ctx.strokeText(str, x, y);
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = size * 0.16;
			ctx.strokeText(str, x, y);
			ctx.fillStyle = fill;
			ctx.fillText(str, x, y);
		};

		const label = (str, x, y, align) => {
			ctx.font = '900 9px "Arial Black", "Helvetica Neue", Arial, sans-serif';
			ctx.textAlign = align;
			ctx.textBaseline = 'middle';
			ctx.fillStyle = C.labelOrange;
			ctx.fillText(str, x, y);
		};

		const drawReady = () => {
			const mid = W / 2;
			title('Get Ready!', mid, H * 0.22, 30, '#5ec44a');

			const hx = mid + 8;
			const hy = H * 0.42;
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = '#ffffff';
			ctx.beginPath();
			ctx.moveTo(hx, hy - 16);
			ctx.lineTo(hx - 7, hy - 6);
			ctx.lineTo(hx + 7, hy - 6);
			ctx.closePath();
			ctx.fill();
			ctx.fillRect(hx - 2.5, hy - 7, 5, 10);
			ctx.globalAlpha = 1;
			ctx.font = '900 11px "Arial Black", "Helvetica Neue", Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 3;
			ctx.strokeStyle = C.outline;
			ctx.strokeText('TAP', hx, hy + 14);
			ctx.fillStyle = '#ffffff';
			ctx.fillText('TAP', hx, hy + 14);
		};

		const drawOver = () => {
			const mid = W / 2;
			const ty = H * 0.22;
			title('Game Over', mid, ty, 30, C.orange);

			const pw = 226;
			const ph = 114;
			const px = Math.round(mid - pw / 2);
			const py = Math.round(ty + 34);
			ctx.fillStyle = C.outline;
			ctx.fillRect(px - 2, py - 2, pw + 4, ph + 4);
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(px, py, pw, ph);
			ctx.fillStyle = C.sand;
			ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
			ctx.fillStyle = C.sandDark;
			ctx.fillRect(px + 2, py + ph - 6, pw - 4, 4);

			label('MEDAL', px + 46, py + 18, 'center');
			const medal = MEDALS.find((m) => s.score >= m.min);
			const mx = px + 46;
			const my = py + 60;
			ctx.fillStyle = medal ? medal.rim : '#cbc480';
			ctx.beginPath();
			ctx.arc(mx, my, 24, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = medal ? medal.color : '#d6cf86';
			ctx.beginPath();
			ctx.arc(mx, my, 20, 0, Math.PI * 2);
			ctx.fill();

			const rx = px + pw - 16;
			label('SCORE', rx, py + 18, 'right');
			drawNumber(s.score, rx, py + 28, 3, 'right');
			label('BEST', rx, py + 66, 'right');
			drawNumber(s.best, rx, py + 76, 3, 'right');
			if (s.newBest) {
				const nx = rx - digitsWidth(String(s.best), 3) - 30;
				ctx.fillStyle = '#ff3b30';
				ctx.fillRect(nx, py + 81, 24, 11);
				ctx.font = '900 8px "Arial Black", "Helvetica Neue", Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.fillStyle = '#ffffff';
				ctx.fillText('NEW', nx + 12, py + 87);
			}

			if (performance.now() - s.overAt > 600) {
				const by = py + ph + 22;
				ctx.fillStyle = C.outline;
				ctx.fillRect(mid - 52, by - 2, 104, 30);
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(mid - 50, by, 100, 26);
				ctx.fillStyle = C.orange;
				ctx.fillRect(mid - 47, by + 3, 94, 20);
				ctx.font = '900 12px "Arial Black", "Helvetica Neue", Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = '#ffffff';
				ctx.fillText('PLAY', mid, by + 13.5);
			}
		};

		const draw = () => {
			ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
			ctx.imageSmoothingEnabled = false;
			if (backdrop) ctx.drawImage(backdrop, 0, 0, W, H);

			s.pipes.forEach(drawPipe);
			drawGround();
			drawBird();

			if (s.mode === 'ready') drawReady();
			else if (s.mode === 'over') drawOver();
			else drawNumber(s.score, W / 2, 40, 5);

			if (s.flash > 0) {
				ctx.fillStyle = '#ffffff';
				ctx.globalAlpha = s.flash * 0.8;
				ctx.fillRect(0, 0, W, H);
				ctx.globalAlpha = 1;
			}
		};

		const frame = (now) => {
			const dt = Math.max(0, Math.min((now - last) / (1000 / 60), 3));
			last = now;
			update(dt);
			draw();
			raf = requestAnimationFrame(frame);
		};

		const onPointer = (e) => {
			e.preventDefault();
			flap();
		};
		const onKey = (e) => {
			if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
				e.preventDefault();
				flap();
			}
		};
		const onVisibility = () => {
			last = performance.now();
		};

		const ro = new ResizeObserver(resize);
		ro.observe(wrap);
		resize();
		reset();
		canvas.addEventListener('pointerdown', onPointer);
		window.addEventListener('keydown', onKey);
		document.addEventListener('visibilitychange', onVisibility);
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			canvas.removeEventListener('pointerdown', onPointer);
			window.removeEventListener('keydown', onKey);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, []);

	return (
		<div className='game' ref={wrapRef}>
			<canvas ref={canvasRef} className='gameWindow' aria-label='Flappy Bird game' />
		</div>
	);
};

export default Flappybird;
