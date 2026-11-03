import { motion } from 'framer-motion';
import { FilmDisclosure } from '../FilmDisclosure';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene3() {
  return (
    <motion.section
      className="film-stage"
      initial={{ clipPath: 'circle(16% at 57% 46%)', scale: 1.04 }}
      animate={{ clipPath: 'circle(150% at 57% 46%)', scale: 1 }}
      exit={{ clipPath: 'polygon(0 0, 100% 0, 56% 100%, 0 100%)', opacity: 0 }}
      transition={{ duration: 0.64, ease: EASE }}
      style={{ background: 'radial-gradient(ellipse at 52% 48%, #124b69 0%, #092d48 43%, #061e34 100%)' }}
    >
      <div className="film-grid" style={{ position: 'absolute', inset: 0, opacity: 0.72 }} />
      <motion.svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        initial={{ scale: 0.95, rotate: -1.2, x: '1%' }}
        animate={{ scale: [0.95, 1.02, 1.06], rotate: [-1.2, 0, 1.1], x: ['1%', '0%', '-1%'] }}
        transition={{ duration: 7.1, ease: 'linear', times: [0, 0.6, 1] }}
        style={{ position: 'absolute', inset: '-5%', width: '110%', height: '110%' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waterFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#70d7d1" stopOpacity="0.19" />
            <stop offset="100%" stopColor="#70d7d1" stopOpacity="0.015" />
          </linearGradient>
          <linearGradient id="routeStroke" x1="0" x2="1">
            <stop offset="0%" stopColor="#72d9db" />
            <stop offset="100%" stopColor="#9af4dc" />
          </linearGradient>
        </defs>
        <path
          d="M-40 160 C190 75 250 300 440 248 S720 62 945 145 1230 345 1640 174 L1640 265 C1330 470 1190 308 950 247 S645 402 438 350 180 206 -40 295Z"
          fill="url(#waterFill)"
        />
        <path d="M-40 630 C185 515 340 688 520 566 S820 465 1010 585 1325 708 1640 530" fill="none" stroke="rgba(139,210,224,.13)" strokeWidth="2" />
        <path d="M40 90 C214 192 228 415 378 495 S673 597 742 860" fill="none" stroke="rgba(183,228,236,.14)" strokeWidth="2" />
        <path d="M134 0 C320 174 424 234 570 312 S812 466 875 900" fill="none" stroke="rgba(183,228,236,.12)" strokeWidth="2" />
        <path d="M1050 -20 C892 148 1010 284 1197 383 S1405 573 1443 936" fill="none" stroke="rgba(183,228,236,.13)" strokeWidth="2" />
        <path d="M0 420 C217 342 369 372 539 459 S837 705 1097 649 1394 401 1620 418" fill="none" stroke="rgba(183,228,236,.12)" strokeWidth="2" />
        <path d="M320 0 C471 155 570 161 741 206 S1080 326 1075 480" fill="none" stroke="rgba(183,228,236,.11)" strokeWidth="2" />
        <motion.path
          d="M190 690 C335 612 444 634 565 530 S730 375 879 410 1040 539 1182 462 1323 322 1455 304"
          fill="none"
          stroke="url(#routeStroke)"
          strokeWidth="4"
          strokeDasharray="10 13"
          initial={{ pathLength: 0, opacity: 0.15 }}
          animate={{ pathLength: 1, opacity: 0.94, strokeDashoffset: [0, -46] }}
          transition={{ pathLength: { delay: 0.5, duration: 2.1, ease: EASE }, opacity: { duration: 0.45 }, strokeDashoffset: { duration: 7.1, ease: 'linear' } }}
        />
        <motion.path
          d="M523 302 C674 230 856 260 927 402 C1014 572 882 690 713 665 C553 640 451 481 523 302Z"
          fill="rgba(95,220,206,.075)"
          stroke="rgba(126,236,219,.78)"
          strokeWidth="2"
          strokeDasharray="8 9"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.95, duration: 1.1, ease: EASE }}
        />
        {[
          { cx: 565, cy: 530, delay: 1.3 },
          { cx: 879, cy: 410, delay: 1.55 },
          { cx: 1182, cy: 462, delay: 1.8 },
          { cx: 713, cy: 665, delay: 2.05 },
        ].map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.cx}
              cy={point.cy}
              r="15"
              fill="rgba(100,226,208,.17)"
              stroke="rgba(140,246,225,.9)"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.35, 1], opacity: [0, 1, 0.88] }}
              transition={{ delay: point.delay, duration: 0.54, ease: EASE }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <circle cx={point.cx} cy={point.cy} r="3.5" fill="#d4fff4" />
          </g>
        ))}
      </motion.svg>

      <motion.h1
        className="film-headline"
        initial={{ opacity: 0, x: -30, clipPath: 'inset(0 100% 0 0)' }}
        animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
        transition={{ delay: 0.28, duration: 0.62, ease: EASE }}
        style={{ position: 'absolute', left: '6%', top: '11%', fontSize: '8vmin', zIndex: 3 }}
      >
        A CLEARER VIEW.
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46, duration: 0.36, ease: EASE }}
        style={{
          position: 'absolute',
          right: '6%',
          top: '12%',
          zIndex: 4,
          padding: '1.1vmin 1.5vmin',
          color: '#cff7f4',
          border: '1px solid rgba(178,239,237,.34)',
          background: 'rgba(6,37,58,.62)',
          font: '600 1.9vmin/1.2 var(--font-mono)',
          letterSpacing: '0.08em',
        }}
      >
        ILLUSTRATIVE MAP · NOT LIVE GIS
      </motion.div>

      {[
        { label: 'COMMUNITY', left: '23%', top: '56%', delay: 1.25 },
        { label: 'ENVIRONMENT', left: '70%', top: '39%', delay: 2.95 },
        { label: 'SHARED CONTEXT', left: '43%', top: '72%', delay: 4.5 },
      ].map(({ label, left, top, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay, duration: 0.38, ease: EASE }}
          style={{
            position: 'absolute',
            left,
            top,
            zIndex: 5,
            color: '#efffff',
            padding: '0.9vmin 1.2vmin',
            background: 'rgba(7,38,58,.74)',
            borderLeft: '0.35vmin solid #87eddd',
            font: '600 2.1vmin/1.2 var(--font-mono)',
            letterSpacing: '0.11em',
            boxShadow: '0 0.5vmin 2vmin rgba(1,17,28,.2)',
          }}
        >
          {label}
        </motion.div>
      ))}
      <FilmDisclosure>SAMPLE PROTOTYPE · NO LIVE DATA</FilmDisclosure>
    </motion.section>
  );
}
