import * as React from 'react';
import { createGlobalStyle } from 'styled-components';
import { coinWidth, Matter } from './matter';

const defaultCoinThickness = 5;

const Global = createGlobalStyle`
  html, body {
    height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  #app {
    height: 100%;
  }
`;

export const App: React.FC = () => {
  const [coinThickness, setCoinThickness] =
    React.useState(defaultCoinThickness);

  const [numCoins, setNumCoins] = React.useState(10);

  const ref = React.useRef<HTMLDivElement | null>(null);

  const [bounds, setBounds] = React.useState<{ width: number; height: number }>(
    { width: window.innerWidth, height: window.innerHeight }
  );

  React.useEffect(() => {
    const onResize = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setBounds({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <Global />
      <div
        style={{
          fontFamily: 'sans-serif',
          color: 'white',
          width: '100%',
          height: '100%',
          position: 'relative',
          background: 'black',
        }}
        ref={ref}
      >
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
          Aspect ratio = {Math.round((100 * coinThickness) / coinWidth) / 100}
        </div>
        <div style={{ position: 'absolute', top: 30, left: 10, zIndex: 1 }}>
          <input
            type="range"
            min={1}
            max={coinWidth}
            value={coinThickness}
            onChange={(e) => setCoinThickness(Number(e.target.value))}
          />
        </div>
        <div style={{ position: 'absolute', top: 10, left: 200, zIndex: 1 }}>
          # coins = {numCoins}
        </div>
        <div style={{ position: 'absolute', top: 30, left: 200, zIndex: 1 }}>
          <input
            type="range"
            min={0}
            max={4}
            step={0.1}
            value={Math.log10(numCoins)}
            onChange={(e) =>
              setNumCoins(Math.round(10 ** Number(e.target.value)))
            }
          />
        </div>
        <Matter
          key={JSON.stringify([
            coinThickness,
            bounds.height,
            bounds.width,
            numCoins,
          ])}
          coinThickness={coinThickness}
          worldHeight={bounds.height}
          worldWidth={bounds.width}
          numCoins={numCoins}
        />
      </div>
    </>
  );
};
