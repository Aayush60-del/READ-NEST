import { motion, useReducedMotion } from 'framer-motion';

const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 60,
  once = true,
  threshold = 0.15,
  className = '',
  style = {},
}) => {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
      x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
      scale: direction === 'scale' ? 0.9 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once, amount: threshold }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
