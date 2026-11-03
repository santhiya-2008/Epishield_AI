import { motion } from 'framer-motion';
import { FilmDisclosure } from '../FilmDisclosure';

const EASE = [0.22, 1, 0.36, 1] as const;
const BASE = import.meta.env.BASE_URL;

export function Scene2() {
  return (
    <motion.section
      className="film-stage"
      initial={{ clipPath: 'circle(12% at 72% 48%)', scale: 1.02 }}
      animate={{ clipPath: 'circle(150% at 72% 48%)', scale: 1 }}
      exit={{ clipPath: 'polygon(0 0, 52% 0, 38% 100%, 0 100%)', opacity: 0 }}
      transition={{ duration: 0.62, ease: EASE }}
      style={{ background: '#06253c' }}
    >
      <motion.img
        className="film-photo"
        src={`${BASE}images/about-environment.jpg`}
        alt=""
        initial={{ scale: 1.2, x: '2%' }}
        animate={{ scale: [1.2, 1.16, 1.04], x: ['2%', '0%', '-2%'] }}
        transition={{ duration: 6.1, ease: 'linear', times: [0, 0.58, 1] }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(4, 24, 42, .93) 0%, rgba(5, 38, 61, .72) 46%, rgba(3, 31, 49, .24) 100%), linear-gradient(0deg, rgba(3, 19, 33, .54), transparent 48%)',
        }}
      />

      <motion.div
        className="film-ring"
        style={{ left: '72%', top: '48%', marginLeft: '-9vmin', marginTop: '-9vmin' }}
        initial={{ scale: 0.52, opacity: 0.78 }}
        animate={{ scale: [0.82, 1.12, 0.97], opacity: [0.68, 0.96, 0.78] }}
        transition={{ duration: 6.1, ease: 'easeInOut', times: [0, 0.6, 1] }}
      />

      <motion.div
        className="film-glass"
        initial={{ x: '-8vw', opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
        animate={{ x: '0vw', opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
        transition={{ delay: 0.28, duration: 0.62, ease: EASE }}
        style={{
          position: 'absolute',
          left: '8%',
          top: '20%',
          width: '40%',
          height: '60%',
          borderRadius: '2.4vmin',
          padding: '4.2vmin 4.5vmin',
          boxSizing: 'border-box',
          zIndex: 4,
        }}
      >
        <motion.p
          className="film-kicker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          style={{ margin: 0 }}
        >
          SAMPLE AI PREVIEW
        </motion.p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.4vmin', marginTop: '3.4vmin' }}>
          <motion.svg
            viewBox="0 0 160 160"
            initial={{ rotate: -110 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.62, duration: 1.5, ease: EASE }}
            style={{ width: '17vmin', height: '17vmin', flex: '0 0 auto', overflow: 'visible' }}
            aria-hidden="true"
          >
            <circle cx="80" cy="80" r="40" fill="none" stroke="rgba(221,249,255,.2)" strokeWidth="6" />
            <motion.circle
              cx="80"
              cy="80"
              r="40"
              fill="none"
              stroke="#85f1de"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="251.3"
              initial={{ strokeDashoffset: 251.3, opacity: 0 }}
              animate={{ strokeDashoffset: 35.2, opacity: 1 }}
              transition={{ delay: 0.72, duration: 1.35, ease: EASE }}
            />
            <circle cx="80" cy="80" r="29" fill="rgba(2,29,47,.34)" stroke="rgba(188,240,239,.22)" />
            <motion.circle
              cx="80"
              cy="40"
              r="3.5"
              fill="#d4fff4"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 1, 0.85], scale: [0.3, 1.45, 1] }}
              transition={{ delay: 1.8, duration: 0.6, ease: EASE }}
            />
          </motion.svg>
          <div>
            <motion.div
              className="film-headline"
              initial={{ scale: 1.35, opacity: 0, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.72, duration: 0.56, ease: EASE }}
              style={{ fontSize: '22vmin', lineHeight: 0.84, whiteSpace: 'nowrap' }}
            >
              86%
            </motion.div>
            <motion.div
              className="film-cyan"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.45, duration: 0.42, ease: EASE }}
              style={{
                marginTop: '1.5vmin',
                font: '700 5.8vmin/1 var(--font-display)',
                letterSpacing: '0.08em',
              }}
            >
              HIGH
            </motion.div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.4, ease: EASE }}
          style={{
            color: 'rgba(240,251,255,.91)',
            font: '600 2.2vmin/1.3 var(--font-mono)',
            letterSpacing: '0.08em',
            margin: '2.2vmin 0 0',
            textTransform: 'uppercase',
          }}
        >
          ZONE A · ILLUSTRATIVE RISK SCORE
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.45, duration: 0.5 }}
        style={{
          position: 'absolute',
          right: '9%',
          bottom: '18%',
          display: 'flex',
          alignItems: 'center',
          gap: '1.8vmin',
          zIndex: 3,
        }}
      >
        {['WATER', 'COMMUNITY', 'ENVIRONMENT'].map((label, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: [0, 0.82, 0.7], y: 0, scale: 1 }}
            transition={{ delay: 2.5 + index * 0.28, duration: 0.44, ease: EASE }}
            style={{
              padding: '1.1vmin 1.4vmin',
              borderRadius: 999,
              color: '#dffaf6',
              border: '1px solid rgba(183,240,241,.34)',
              background: 'rgba(9,59,84,.48)',
              font: '600 1.8vmin/1 var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            {label}
          </motion.div>
        ))}
      </motion.div>
      <FilmDisclosure>SAMPLE PROTOTYPE · NO LIVE DATA</FilmDisclosure>
    </motion.section>
  );
}
