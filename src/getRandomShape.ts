const getRandom = (min: number, max: number) =>
  Math.floor(Math.random()*(max-min+1)+min);

const colors = ['red', '#00ff00', 'rgb(0, 0, 255)', 'rgba(0, 255, 200, 0.5)'];
const getRandomColor = () =>
  colors[getRandom(0, colors.length - 1)];

const createCircle = () => {
  const radius = getRandom(5, 100);
  return `<svg height="${radius * 2}" width="${radius * 2}">
    <circle cx="${radius}"
      cy="${radius}"
      r="${radius}"
      stroke="${getRandomColor()}"
      stroke-width="${getRandom(1, 20)}"
      fill="${getRandomColor()}"
    />
  </svg>`
  .replace(/\n/g, '')
}

const createSquare = () => {
  const size = getRandom(5, 100);
  return `<svg height="${size}" width="${size}">
    <rect
      width="${size}"
      height="${size}"
      stroke="${getRandomColor()}"
      stroke-width="${getRandom(1, 20)}"
      fill="${getRandomColor()}"
    />
  </svg>`
  .replace(/\n/g, '')
}

const createRect = () => {
  const height = getRandom(5, 100);
  const width = getRandom(5, 100);
  return `<svg height="${height}" width="${width}">
    <rect
      width="${width}"
      height="${height}"
      stroke="${getRandomColor()}"
      stroke-width="${getRandom(1, 20)}"
      fill="${getRandomColor()}"
    />
  </svg>`
  .replace(/\n/g, '')
}

const createTriangle = () => {
  const height = getRandom(5, 100);
  const width = getRandom(5, 100);
  const points: string[] = [];

  for(let i = 0; i < 3; i++) {
    points.push(`${getRandom(0, width)},${getRandom(0, height)}`)
  }

  return `<svg height="${height}" width="${width}">
    <polygon
      points="${points.join(' ')}"
      stroke="${getRandomColor()}"
      stroke-width="${getRandom(1, 20)}"
      fill="${getRandomColor()}"
    />
  </svg>`
  .replace(/\n/g, '')
}

const getRandomShape = (shape: string) => {
  switch(shape) {
    case "circle": return createCircle();
    case "square": return createSquare();
    case "rectangle": return createRect();
    case "triangle": return createTriangle();
  }
}

export default getRandomShape;
