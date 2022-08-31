import * as React from 'react';
import { Bodies, Composite, Engine, Render, Runner, Body } from 'matter-js';

export const coinWidth = 50;

const worldWidth = 800;
const numCoins = 10;
const xStep = worldWidth / (numCoins + 1);
const x0s = new Array(numCoins).fill(0).map((_, i) => (i + 1) * xStep);

export const Matter: React.FC<{ coinThickness: number }> = ({
  coinThickness,
}) => {
  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    var engine = Engine.create();

    var render = Render.create({
      element: ref.current,
      engine: engine,
    });

    const coins = new Array(numCoins)
      .fill(0)
      .map((_, i) =>
        Bodies.rectangle(
          x0s[i],
          570 + coinThickness / 2,
          coinWidth,
          coinThickness
        )
      );
    coinsRef.current = coins;
    var ground = Bodies.rectangle(worldWidth / 2, 610, 810, 60, {
      isStatic: true,
    });

    Composite.add(engine.world, [...coins, ground]);

    Render.run(render);
    var runner = Runner.create();

    Runner.run(runner, engine);
  }, []);

  const ref = React.useRef<HTMLDivElement | null>(null);
  const coinsRef = React.useRef<Body[] | null>(null);
  const cancelled = React.useRef(false);

  const flip = React.useCallback((index: number) => {
    if (coinsRef.current) {
      const coin = coinsRef.current[index];
      const offset = -coinWidth / 2;

      const force = coinThickness * coinWidth * (4e-5 * (1 + Math.random()));

      Body.setPosition(coin, { x: x0s[index], y: 570 + coinThickness / 2 });

      Body.applyForce(
        coin,
        { x: coin.position.x + offset, y: 570 },
        { x: 0, y: -force }
      );

      setFlips((s) => s + 1);

      launched.current[index] = force;
    }
  }, []);

  const launched = React.useRef(new Array(numCoins).fill(0));

  const [successes, setSuccesses] = React.useState<number>(0);
  const [flips, setFlips] = React.useState<number>(0);

  const startAutoflip = React.useCallback(() => {
    setAutoflip(true);
    cancelled.current = false;
    const maybeFlip = () => {
      if (!coinsRef.current) {
        return;
      }

      for (const [i, coin] of coinsRef.current.entries()) {
        const speed = Math.hypot(coin.velocity.x, coin.velocity.y);
        if (speed < 1e-6) {
          const degs = ((coin.angle * 180) / Math.PI) % 360;
          console.log(`Landed at angle ${degs}`);

          if (
            Math.abs(Math.abs(degs) - 90) < 5 ||
            Math.abs(Math.abs(degs) - 270) < 5
          ) {
            setSuccesses((s) => s + 1);
          }
          flip(i);
        }
      }

      if (!cancelled.current) {
        requestAnimationFrame(maybeFlip);
      }
    };

    maybeFlip();
  }, [flip]);

  const stopAutoflip = React.useCallback(() => {
    cancelled.current = true;
    setAutoflip(false);
  }, []);

  const [autoFlip, setAutoflip] = React.useState(false);

  return (
    <>
      <div ref={ref} style={{ height: 600, width: worldWidth }} />
      <div style={{ position: 'relative', height: 48 }}>
        {new Array(numCoins).fill(0).map((_, i) => (
          <button
            key={i}
            style={{
              position: 'absolute',
              left: x0s[i],
              top: 6,
              transform: `translateX(-50%)`,
            }}
            onClick={() => flip(i)}
          >
            Flip
          </button>
        ))}
      </div>

      <button onClick={autoFlip ? stopAutoflip : startAutoflip}>
        {autoFlip ? 'Stop' : 'Start'} autoflip
      </button>
      <div>
        {successes} edges / {flips} flips
      </div>
    </>
  );
};
