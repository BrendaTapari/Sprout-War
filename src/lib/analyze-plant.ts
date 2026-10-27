export type PlantStats = {
  hp: number;
  attack: number;
  defense: number;
};

export function analyzePlantStats(dataUrl: string): Promise<PlantStats> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(statsFromImage(image));
    image.onerror = () => resolve({ hp: 110, attack: 22, defense: 16 });
    image.src = dataUrl;
  });
}

function statsFromImage(image: HTMLImageElement): PlantStats {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { hp: 110, attack: 22, defense: 16 };
  context.drawImage(image, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);
  const light: number[] = [];
  const sat: number[] = [];
  for (let index = 0; index < data.length; index += 4) {
    const hsl = rgbToHsl(data[index], data[index + 1], data[index + 2]);
    light.push(hsl.l);
    sat.push(hsl.s);
  }
  const count = light.length;
  const meanLight = average(light);
  const meanSat = average(sat);
  const contrast = Math.sqrt(average(light.map((value) => (value - meanLight) ** 2)));
  let edges = 0;
  let edgeCount = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 1; x < size; x += 1) {
      edges += Math.abs(light[y * size + x] - light[y * size + x - 1]);
      edgeCount += 1;
    }
  }
  const texture = Math.min(1, edges / edgeCount / 0.12);
  const hp = clamp(Math.round(98 + meanLight * 28 + (1 - contrast) * 10), 96, 138);
  const attack = clamp(Math.round(16 + meanSat * 8 + texture * 12), 16, 34);
  const defense = clamp(Math.round(10 + (1 - texture) * 12 + (1 - meanSat) * 6), 8, 28);
  return { hp, attack, defense };
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const light = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { s: 0, l: light };
  const saturation = delta / (1 - Math.abs(2 * light - 1));
  return { s: saturation, l: light };
}
