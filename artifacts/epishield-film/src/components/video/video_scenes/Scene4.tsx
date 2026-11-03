import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';
import { FilmDisclosure } from '../FilmDisclosure';

const EASE = [0.22, 1, 0.36, 1] as const;
const BASE = import.meta.env.BASE_URL;
const STAGES = ['DATA COLLECTION', 'AI ANALYSIS', 'RISK DETECTION', 'ALERT', 'COMMUNITY RESPONSE'];

export function Scene4() {
  const [activeStage, setActiveStage] = useState(-1);
  useSceneTimer([
    { time: 750, callback: () => setActiveStage(0) },
    { time: 1550, callback: () => setActiveStage(1) },
    { time: 2350, callback: () => setActiveStage(2) },
    { time: 3150, callback: () => setActiveStage(3) },
    { time: 3950, callback: () => setActiveStage(4) },
    { time: 5150, callback: () => setActiveStage(-1) },
  ]);

  return (
    <motion.section
      className="film-stage"
      initial={{ clipPath: 'polygon(0 0, 100% 0, 91% 100%, 12% 100%)', opacity: 0 }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1 }}
      exit={{ clipPath: 'inset(0 50% 0 50%)', opacity: 0 }}
      transition={{ duration: 0.62, ease: EASE }}
      style={{ background: '#062238' }}
    >
      <div style={{ position: 'absolute', inset: '0 0 28% 0', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        <motion.div
          initial={{ x: '-5%', scale: 1.1 }}
          animate={{ x: ['-5%', '0%', '2%'], scale: [1.1, 1.05, 1.12] }}
          transition={{ duration: 6.8, ease: 'linear', times: [0, 0.45, 1] }}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <img
            src={`${BASE}images/about-disease.jpg`}
            alt=""
            style={{ width: '110%', height: '110%', objectFit: 'cover', position: 'absolute', inset: '-5%' }}
          />
        </motion.div>
        <motion.div
          initial={{ x: '5%', scale: 1.08 }}
          animate={{ x: ['5%', '0%', '-2%'], scale: [1.08, 1.02, 1.13] }}
          transition={{ duration: 6.8, ease: 'linear', times: [0, 0.45, 1] }}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <img
            src={`${BASE}images/about-response.jpg`}
            alt=""
            style={{ width: '110%', height: '110%', objectFit: 'cover', position: 'absolute', inset: '-5%' }}
          />
        </motion.div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(4,26,43,.67), rgba(7,39,57,.08) 46%, rgba(4,26,43,.28)), linear-gradient(0deg, rgba(4,29,47,.98) 1%, rgba(5,35,54,.44) 53%, rgba(5,29,47,.2))',
            pointerEvents: 'none',
          }}
        />
        <AnimatePresence mode="sync">
          {activeStage === 1 && (
            <motion.div
              key="ai-fold"
              initial={{ clipPath: 'inset(0 0 0 100%)', opacity: 0 }}
              animate={{ clipPath: 'inset(0 0 0 0%)', opacity: 0.9 }}
              exit={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
              transition={{ duration: 0.36, ease: EASE }}
              style={{ position: 'absolute', right: '5%', top: '15%', width: '36%', height: '48%', zIndex: 4, overflow: 'hidden', border: '1px solid rgba(198,245,247,.6)' }}
            >
              <img
                src={`${BASE}images/about-ai.jpg`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.h1
        className="film-headline"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.45, ease: EASE }}
        style={{
          position: 'absolute',
          left: '6%',
          top: '7%',
          zIndex: 8,
          fontSize: '7.4vmin',
          textShadow: '0 0.5vmin 1.5vmin rgba(1,15,27,.48)',
        }}
      >
        FROM SIGNAL TO RESPONSE
      </motion.h1>

      <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: '21%', zIndex: 8, height: '0.23vmin', background: 'rgba(155,227,231,.4)' }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.65, duration: 4.55, ease: 'linear' }}
          style={{ width: '100%', height: '100%', transformOrigin: 'left', background: 'linear-gradient(90deg,#76d9dc,#94f0d9)' }}
        />
        {STAGES.map((stage, index) => {
          const active = index <= activeStage;
          return (
            <motion.div
              key={stage}
              animate={{
                scale: active ? 1.32 : 1,
                backgroundColor: active ? '#9af3df' : '#1a5a76',
                boxShadow: active ? '0 0 2.2vmin rgba(114,239,219,.8)' : '0 0 0 rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.22, ease: EASE }}
              style={{
                position: 'absolute',
                left: `${index * 25}%`,
                top: '50%',
                width: '1.5vmin',
                height: '1.5vmin',
                borderRadius: '50%',
                border: '0.18vmin solid rgba(214,255,246,.85)',
                transform: 'translate(-50%,-50%)',
              }}
            />
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: '27%', display: 'flex', justifyContent: 'space-between', zIndex: 7 }}>
        {STAGES.map((stage, index) => (
          <span
            key={stage}
            style={{
              color: index <= activeStage ? '#a5f2e3' : 'rgba(223,245,249,.44)',
              font: '600 1.55vmin/1 var(--font-mono)',
              letterSpacing: '0.08em',
              width: '16%',
              textAlign: index === 0 ? 'left' : index === STAGES.length - 1 ? 'right' : 'center',
              whiteSpace: 'nowrap',
            }}
          >
            0{index + 1}
          </span>
        ))}
      </div>

      <AnimatePresence mode="sync">
        {activeStage >= 0 && (
          <motion.div
            key={STAGES[activeStage]}
            initial={{ opacity: 0, y: 16, filter: 'blur(7px)', scale: 0.96 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)', scale: 1.02 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              position: 'absolute',
              left: '8%',
              bottom: '8%',
              zIndex: 9,
              color: '#f2ffff',
              font: '650 5.2vmin/1 var(--font-display)',
              letterSpacing: '-0.035em',
              textShadow: '0 0.5vmin 2vmin rgba(0,14,25,.58)',
            }}
          >
            {STAGES[activeStage]}
          </motion.div>
        )}
      </AnimatePresence>

      <FilmDisclosure>SAMPLE WORKFLOW · NO LIVE SERVICE</FilmDisclosure>
    </motion.section>
  );
}
