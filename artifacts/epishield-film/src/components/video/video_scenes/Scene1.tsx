import { motion } from 'framer-motion';
import { FilmDisclosure } from '../FilmDisclosure';

const EASE = [0.22, 1, 0.36, 1] as const;
const BASE = import.meta.env.BASE_URL;

export function Scene1() {
  return (
    <motion.section
      className="film-stage"
      initial={{ clipPath: 'circle(12% at 72% 48%)' }}
      animate={{ clipPath: 'circle(150% at 72% 48%)' }}
      exit={{ clipPath: 'circle(10% at 72% 48%)', opacity: 0 }}
      transition={{ duration: 0.64, ease: EASE }}
    >
      <motion.img
        className="film-photo"
        src={`${BASE}images/about-response.jpg`}
        alt=""
        initial={{ scale: 1.18, x: '-1%' }}
        animate={{ scale: [1.18, 1.2, 1.06], x: ['-1%', '0%', '2%'] }}
        transition={{ duration: 5.2, ease: 'linear', times: [0, 0.4, 1] }}
      />
      <div className="film-veil" />
      <motion.div
        className="film-ring"
        style={{ left: '72%', top: '48%', marginLeft: '-9vmin', marginTop: '-9vmin' }}
        initial={{ scale: 0.46, opacity: 0 }}
        animate={{ scale: [0.46, 0.94, 1.12], opacity: [0.1, 0.94, 0.56], x: ['0vw', '-1vw', '-6vw'] }}
        transition={{ duration: 5.2, ease: 'easeOut', times: [0, 0.26, 1] }}
      />

      <div style={{ position: 'absolute', left: '6%', top: '25%', width: '54%', zIndex: 5 }}>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '32%', opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.42, ease: EASE }}
          style={{ height: '0.26vmin', background: '#8cf2e1', marginBottom: '2.4vmin' }}
        />
        <motion.h1
          className="film-headline"
          initial={{ clipPath: 'inset(0 0 100% 0)', y: 20, scale: 0.9 }}
          animate={{ clipPath: 'inset(0 0 0% 0)', y: 0, scale: 1 }}
          transition={{ delay: 0.48, duration: 0.58, ease: EASE }}
          style={{ fontSize: '30vmin', textTransform: 'uppercase' }}
        >
          EARLY
        </motion.h1>
        <motion.p
          className="film-support"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.18, duration: 0.48, ease: EASE }}
          style={{ margin: '2.4vmin 0 0', maxWidth: '48vmin' }}
        >
          can change what happens next.
        </motion.p>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 0.3], opacity: [0, 0.8, 0.12] }}
        transition={{ delay: 0.18, duration: 1.15, ease: EASE, times: [0, 0.32, 1] }}
        style={{
          position: 'absolute',
          left: '6%',
          top: '18%',
          width: '37%',
          height: 1,
          transformOrigin: 'left',
          background: 'linear-gradient(90deg, transparent, #8bf2e4, transparent)',
        }}
      />

      <FilmDisclosure>SAMPLE PROTOTYPE · NO LIVE DATA</FilmDisclosure>
    </motion.section>
  );
}
