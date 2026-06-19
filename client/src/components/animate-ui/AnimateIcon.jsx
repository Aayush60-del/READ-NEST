import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef } from 'react';
import { motion, useAnimationControls, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const iconAnimations = {
  default: {
    keyframes: { scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] },
    transition: { duration: 0.55, ease: 'easeOut' },
  },
  path: {
    keyframes: { pathLength: [0.4, 1], opacity: [0.65, 1] },
    transition: { duration: 0.65, ease: 'easeOut' },
  },
  pulse: {
    keyframes: { scale: [1, 1.16, 1], opacity: [0.82, 1, 0.92] },
    transition: { duration: 0.75, ease: 'easeInOut' },
  },
  float: {
    keyframes: { y: [0, -4, 0], rotate: [0, 2, 0] },
    transition: { duration: 0.9, ease: 'easeInOut' },
  },
  draw: {
    keyframes: { scale: [0.96, 1.06, 1], rotate: [-4, 3, 0] },
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  turn: {
    keyframes: { rotate: [0, -12, 12, 0], x: [0, 2, -1, 0] },
    transition: { duration: 0.62, ease: 'easeOut' },
  },
  spark: {
    keyframes: { scale: [1, 1.22, 0.96, 1], rotate: [0, 12, -8, 0] },
    transition: { duration: 0.62, ease: 'easeOut' },
  },
};

const getAnimation = (animation) => iconAnimations[animation] || iconAnimations.default;

const enhanceChild = (child) => {
  if (!isValidElement(child)) return child;

  return cloneElement(child, {
    'aria-hidden': child.props['aria-hidden'] ?? true,
    focusable: child.props.focusable ?? false,
    className: cn('shrink-0', child.props.className),
    strokeWidth: child.props.strokeWidth ?? 2.15,
  });
};

const AnimateIcon = ({
  children,
  asChild = false,
  animate = false,
  animateOnHover = false,
  animateOnTap = false,
  animateOnView = false,
  animateOnViewMargin = '0px',
  animateOnViewOnce = true,
  initialOnAnimateEnd = false,
  persistOnAnimateEnd = false,
  completeOnStop = false,
  animation = 'default',
  delay = 0,
  loop = false,
  loopDelay = 0,
  className = '',
  ...props
}) => {
  const ref = useRef(null);
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, {
    margin: animateOnViewMargin,
    once: animateOnViewOnce,
  });

  const animationTarget = useMemo(() => {
    const selectedAnimation = getAnimation(animation);
    return {
      ...selectedAnimation.keyframes,
      transition: {
        ...selectedAnimation.transition,
        delay,
        repeat: !prefersReducedMotion && loop ? Infinity : 0,
        repeatDelay: !prefersReducedMotion && loop ? loopDelay / 1000 : 0,
      },
    };
  }, [animation, delay, loop, loopDelay, prefersReducedMotion]);
  const shouldAnimate = !prefersReducedMotion && Boolean(animate || (animateOnView && isInView));

  useEffect(() => {
    if (shouldAnimate) {
      controls.start(animationTarget).then(() => {
        if (initialOnAnimateEnd && !persistOnAnimateEnd) controls.start({ scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 });
      });
      return;
    }

    if (!completeOnStop && !persistOnAnimateEnd) {
      controls.start({ scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 });
    }
  }, [shouldAnimate, animationTarget, initialOnAnimateEnd, persistOnAnimateEnd, completeOnStop, controls]);

  const hoverTarget = !prefersReducedMotion && animateOnHover ? animationTarget : undefined;
  const tapTarget = !prefersReducedMotion && animateOnTap ? { scale: 0.9, rotate: -5 } : undefined;
  const content = Children.map(children, enhanceChild);

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ref,
      className: cn('inline-flex items-center justify-center', children.props.className, className),
      ...props,
    });
  }

  return (
    <motion.span
      ref={ref}
      className={cn('inline-flex items-center justify-center align-middle', className)}
      animate={controls}
      whileHover={hoverTarget}
      whileTap={tapTarget}
      {...props}
    >
      {content}
    </motion.span>
  );
};

export default AnimateIcon;

