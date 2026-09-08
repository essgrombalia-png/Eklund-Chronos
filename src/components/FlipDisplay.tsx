import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FlipDigitProps {
  char: string;
}

/**
 * Individual digit with smooth 3D flip-style mechanical animation
 */
export const FlipDigit: React.FC<FlipDigitProps> = ({ char }) => {
  // Non-numeric characters (colons, spaces) render statically without animation
  if (!/^\d$/.test(char)) {
    return (
      <span className="inline-flex items-center justify-center select-none text-neutral-400 dark:text-neutral-500 font-mono px-0.5">
        {char}
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden align-middle select-none font-mono tabular-nums leading-none"
      style={{
        width: '0.62em',
        height: '1.2em',
        perspective: '320px',
      }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={char}
          initial={{
            rotateX: -80,
            opacity: 0,
            y: '-40%',
          }}
          animate={{
            rotateX: 0,
            opacity: 1,
            y: '0%',
          }}
          exit={{
            rotateX: 80,
            opacity: 0,
            y: '40%',
          }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1], // Smooth mechanical flip dampening
          }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: '50% 50%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

interface FlipTimeDisplayProps {
  timeFormatted: string; // e.g. "08 : 24 : 17"
}

/**
 * Renders the time formatted string with smooth flip transitions for every ticking digit
 */
export const FlipTimeDisplay: React.FC<FlipTimeDisplayProps> = ({ timeFormatted }) => {
  return (
    <span className="inline-flex items-center">
      {timeFormatted.split('').map((char, index) => (
        <FlipDigit key={index} char={char} />
      ))}
    </span>
  );
};
