import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [canUseCursor, setCanUseCursor] = useState(false);

  useEffect(() => {
    const cursorMedia = window.matchMedia(
      '(min-width: 769px) and (pointer: fine) and (hover: hover)'
    );
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateCursorCapability = () => {
      const enabled = cursorMedia.matches && !reducedMotionMedia.matches;
      setCanUseCursor(enabled);
      if (!enabled) {
        document.body.style.cursor = '';
      }
    };

    updateCursorCapability();
    cursorMedia.addEventListener('change', updateCursorCapability);
    reducedMotionMedia.addEventListener('change', updateCursorCapability);

    return () => {
      cursorMedia.removeEventListener('change', updateCursorCapability);
      reducedMotionMedia.removeEventListener('change', updateCursorCapability);
      document.body.style.cursor = '';
    };
  }, []);

  useEffect(() => {
    if (!canUseCursor) return;

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e) => {
      if (['A', 'BUTTON'].includes(e.target.tagName) || e.target.closest('a') || e.target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = '';
    };
  }, [canUseCursor]);

  if (!canUseCursor) return null;

  return (
    <>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isHovering ? 2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 1000, damping: 40, mass: 0.1 }}
      />
      
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-white/40 rounded-full pointer-events-none z-[998]"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.5 }}
      />
    </>
  );
};

export default CustomCursor;

