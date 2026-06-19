import { useMemo, useState } from 'react';
import { Alignment, Fit, Layout, useRive, useStateMachineInput } from '@rive-app/react-canvas';

const fireStateMachineInput = (input) => {
  if (input && typeof input.fire === 'function') input.fire();
};

const RivePlayer = ({
  src,
  artboard,
  stateMachine,
  hoverInput = 'hover',
  tapInput = 'tap',
  className = '',
  fallback = null,
}) => {
  const [failed, setFailed] = useState(false);
  const layout = useMemo(
    () => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    []
  );

  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    stateMachines: stateMachine,
    autoplay: true,
    layout,
    onLoadError: () => setFailed(true),
  });

  const hover = useStateMachineInput(rive, stateMachine, hoverInput);
  const tap = useStateMachineInput(rive, stateMachine, tapInput);

  if (failed) return fallback;

  return (
    <div
      className={className}
      onMouseEnter={() => fireStateMachineInput(hover)}
      onPointerDown={() => fireStateMachineInput(tap)}
      role="img"
      aria-label="Animated ReadNest reading illustration"
    >
      <RiveComponent className="h-full w-full" />
    </div>
  );
};

export default RivePlayer;

