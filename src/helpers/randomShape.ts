import { colors } from '@app/helpers/assets';
import { randomNumber, randomElementFromArray } from '@app/helpers/helpers';

const createCircle = (): string => {
  const radius = randomNumber(5, 100);
  return `<svg height="${radius * 2}" width="${radius * 2}">
        <circle cx="${radius}"
        cy="${radius}"
        r="${radius}"
        stroke="${randomElementFromArray(colors)}"
        stroke-width="${randomNumber(1, 20)}"
        fill="${randomElementFromArray(colors)}"
        />
    </svg>`.replace(/\n/g, '');
};

const createRect = (opts?: { height: number; width: number }): string => {
  const { height = randomNumber(5, 100), width = randomNumber(5, 100) } = opts || {};
  return `<svg height="${height}" width="${width}">
        <rect
        width="${width}"
        height="${height}"
        stroke="${randomElementFromArray(colors)}"
        stroke-width="${randomNumber(1, 20)}"
        fill="${randomElementFromArray(colors)}"
        />
    </svg>`.replace(/\n/g, '');
};

const createSquare = (): string => {
  const size = randomNumber(5, 100);
  return createRect({ height: size, width: size });
};

const createTriangle = (): string => {
  const height = randomNumber(5, 100);
  const width = randomNumber(5, 100);
  const points: string[] = [];

  for (let i = 0; i < 3; i++) {
    points.push(`${randomNumber(0, width)},${randomNumber(0, height)}`);
  }

  return `<svg height="${height}" width="${width}">
        <polygon
        points="${points.join(' ')}"
        stroke="${randomElementFromArray(colors)}"
        stroke-width="${randomNumber(1, 20)}"
        fill="${randomElementFromArray(colors)}"
        />
    </svg>`.replace(/\n/g, '');
};

export const randomShape = (shape: string): string => {
  switch (shape) {
    case 'circle':
      return createCircle();
    case 'square':
      return createSquare();
    case 'rectangle':
      return createRect();
    case 'triangle':
      return createTriangle();
    default:
      return randomElementFromArray([createCircle(), createSquare(), createRect(), createTriangle()]);
  }
};
