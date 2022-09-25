import * as React from 'react';
import { Bodies, Composite, Engine, Render, Runner, Body } from 'matter-js';

export const coinWidth = 50;

export const Matter: React.FC<{
  coinThickness: number;
  worldHeight: number;
  worldWidth: number;
  numCoins: number;
}> = ({ coinThickness, worldHeight, worldWidth, numCoins }) => {
  const xStep = worldWidth / (numCoins + 1);
  const x0s = new Array(numCoins).fill(0).map((_, i) => (i + 1) * xStep);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    var engine = Engine.create();

    var render = Render.create({
      canvas: ref.current,
      engine: engine,
      options: {
        width: worldWidth,
        height: worldHeight,
      },
    });

    const coins = new Array(numCoins).fill(0).map((_, i) => {
      const coin = Bodies.rectangle(
        x0s[i],
        worldHeight - 30 + coinThickness / 2,
        coinWidth,
        coinThickness,
        {
          collisionFilter: {
            category: -1,
            group: -1,
          },
        }
      );

      return coin;
    });
    coinsRef.current = coins;
    var ground = Bodies.rectangle(
      worldWidth / 2,
      worldHeight + 10,
      worldWidth + 10,
      60,
      {
        isStatic: true,
      }
    );

    Composite.add(engine.world, [...coins, ground]);

    Render.run(render);
    var runner = Runner.create();

    Runner.run(runner, engine);
  }, []);

  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const coinsRef = React.useRef<Body[] | null>(null);
  const cancelled = React.useRef(false);

  const flip = React.useCallback((index: number) => {
    if (coinsRef.current) {
      const coin = coinsRef.current[index];
      const offset = -coinWidth / 2;

      const force = coinThickness * coinWidth * (3e-5 * (1 + Math.random()));

      Body.setPosition(coin, {
        x: x0s[index],
        y: worldHeight - 30 + coinThickness / 2,
      });

      Body.applyForce(
        coin,
        { x: coin.position.x + offset, y: worldHeight - 30 },
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
        if (speed < 1e-5) {
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
      <canvas
        ref={ref}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: worldHeight,
          width: worldWidth,
        }}
        width={worldWidth}
        height={worldHeight}
      />

      <div style={{ position: 'absolute', top: 70, left: 10, zIndex: 1 }}>
        <button onClick={autoFlip ? stopAutoflip : startAutoflip}>
          {autoFlip ? 'Stop' : 'Start'} autoflip
        </button>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 10, zIndex: 1 }}>
        {successes} edges / {flips} flips (
        {flips === 0 ? 0 : Math.round((10000 * successes) / flips) / 100}%)
      </div>
    </>
  );
};
