import * as React from 'react';
import { coinWidth, Matter } from './matter';

const defaultCoinThickness = 5;

export const App: React.FC = () => {
  const [coinThickness, setCoinThickness] =
    React.useState(defaultCoinThickness);

  return (
    <>
      <input
        type="range"
        min={1}
        max={coinWidth}
        value={coinThickness}
        onChange={(e) => setCoinThickness(Number(e.target.value))}
      />
      <Matter key={coinThickness} coinThickness={coinThickness} />
    </>
  );
};
