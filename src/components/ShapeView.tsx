import React from 'react';
import Svg, { Circle, Ellipse, Polygon, Rect } from 'react-native-svg';
import type { ShapeName } from '../types';

function regular(n: number, r: number, rot = -Math.PI / 2, inner?: number): string {
  const pts: string[] = [];
  const total = inner ? n * 2 : n;
  for (let i = 0; i < total; i++) {
    const rad = inner && i % 2 === 1 ? inner : r;
    const a = rot + (i * 2 * Math.PI) / total;
    pts.push(`${(50 + rad * Math.cos(a)).toFixed(1)},${(52 + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function ShapeView({ shape, color = '#4CC9F0', size = 100 }: { shape: ShapeName; color?: string; size?: number }) {
  const stroke = { stroke: '#1B1440', strokeWidth: 3, fill: color };
  let el: React.ReactNode;
  switch (shape) {
    case 'circle':
      el = <Circle cx={50} cy={50} r={40} {...stroke} />;
      break;
    case 'square':
      el = <Rect x={13} y={13} width={74} height={74} rx={3} {...stroke} />;
      break;
    case 'rectangle':
      el = <Rect x={4} y={27} width={92} height={46} rx={3} {...stroke} />;
      break;
    case 'triangle':
      el = <Polygon points="50,8 93,88 7,88" {...stroke} />;
      break;
    case 'oval':
      el = <Ellipse cx={50} cy={50} rx={45} ry={28} {...stroke} />;
      break;
    case 'star':
      el = <Polygon points={regular(5, 46, -Math.PI / 2, 19)} {...stroke} />;
      break;
    case 'pentagon':
      el = <Polygon points={regular(5, 44)} {...stroke} />;
      break;
    case 'hexagon':
      el = <Polygon points={regular(6, 44, 0)} {...stroke} />;
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {el}
    </Svg>
  );
}
