import { motion } from 'framer-motion';
import { FilmDisclosure } from '../FilmDisclosure';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene5() {
  return (
    <motion.section
      className="film-stage"
      initial={{ clipPath: 'circle(13% at 50% 47%)', scale: 1.03 }}
      animate={{ clipPath: 'circle(150% at 50% 47%)', scale: 1 }}
      exit={{ clipPath: 'circle(11% at 72% 48%)', opacity: 0 }}
      transition={{ duration: 0.64, ease: EASE }}
      style={{ background: 'radial-gradient(ellipse at 52% 45%, #0f4567 0%, #082d49 52%, #061d31 100%)' }}
    >
      <div className="film-grid" style={{ position: 'absolute', inset: '-15%', opacity: 0.43 }} />
      <motion.div
        className="film-ring"
        style={{ left: '50%', top: '43%', marginLeft: '-9vmin', marginTop: '-9vmin', width: '34vmin', height: '34vmin' }}
        initial={{ scale: 0.3, opacity: 0.1, rotate: -18 }}
        animate={{ scale: [0.3, 1, 1.06], opacity: [0.1, 0.95, 0.46], rotate: [ -18, 0, 4 ] }}
        transition={{ duration: 6.8, ease: 'easeOut', times: [0, 0.22, 1] }}
      />

      <motion.div
        initial={{ clipPath: 'inset(0 50% 0 50%)', opacity: 0 }}
        animate={{ clipPath: 'inset(0 0% 0 0%)', opacity: 1 }}
        transition={{ delay: 0.36, duration: 0.64, ease: EASE }}
        style={{
          position: 'absolute',
          inset: '24% 12% 20%',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <motion.div
          className="film-headline"
          initial={{ y: 20, opacity: 0, letterSpacing: '0.1em' }}
          animate={{ y: 0, opacity: 1, letterSpacing: '-0.055em' }}
          transition={{ delay: 0.5, duration: 0.78, ease: EASE }}
          style={{ fontSize: '9.2vmin', lineHeight: 0.95 }}
        >
          EPISHIELD
        </motion.div>

        <div style={{ marginTop: '3.3vmin', display: 'flex', flexDirection: 'column', gap: '0.65vmin' }}>
          {['Detect Early.', 'Respond Faster.', 'Protect Communities.'].map((line, index) => (
            <motion.div
              key={line}
              initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
              animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
              transition={{ delay: 1.1 + index * 0.22, duration: 0.42, ease: EASE }}
              style={{
                color: '#dceff5',
                font: '500 3.2vmin/1.16 var(--font-body)',
                letterSpacing: '-0.025em',
              }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.95, duration: 0.38, ease: EASE }}
          style={{
            margin: '2.7vmin 0 0',
            color: 'rgba(197,231,240,.78)',
            font: '600 2.15vmin/1.3 var(--font-mono)',
            letterSpacing: '0.12em',
          }}
        >
          AI-POWERED EARLY EPIDEMIC DETECTION &amp; RESPONSE SYSTEM
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.54, duration: 0.5 }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '43%',
          width: '1px',
          height: '38vmin',
          zIndex: 1,
          opacity: 0.3,
          background: 'linear-gradient(transparent, #9cf4e4, transparent)',
          transform: 'rotate(70deg)',
        }}
      />
      <FilmDisclosure>STATIC PROTOTYPE · NO LIVE DATA</FilmDisclosure>
    </motion.section>
  );
}
