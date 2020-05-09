import { RandomShapeServiceInterface } from "./RandomShapeServiceInterface";
import { Colors } from "@app/models/Colors";
import { getRandomNumber, getRandomElementFromArray } from "@app/helpers/helpers";

type Options = { height: number; width: number };

class RandomShapeSerivce implements RandomShapeServiceInterface {

    public getRandomShape(shape: string): string {
        switch (shape) {
            case 'circle':
                return this.createCircle();
            case 'square':
                return this.createSquare();
            case 'rectangle':
                return this.createRect();
            case 'triangle':
                return this.createTriangle();
            default:
                const random = [this.createCircle(), this.createSquare(), this.createRect(), this.createTriangle()]
                return random[Math.floor(Math.random() * random.length)];
        }
    }

    private createCircle(): string {
        const radius = getRandomNumber(5, 100);
        return `<svg height="${radius * 2}" width="${radius * 2}">
            <circle cx="${radius}"
            cy="${radius}"
            r="${radius}"
            stroke="${this.getRandomColor()}"
            stroke-width="${getRandomNumber(1, 20)}"
            fill="${this.getRandomColor()}"
            />
        </svg>`.replace(/\n/g, '');
    }

    private createRect(opts?: Options): string {
        const { height = getRandomNumber(5, 100), width = getRandomNumber(5, 100) } = opts || {};
        return `<svg height="${height}" width="${width}">
            <rect
            width="${width}"
            height="${height}"
            stroke="${this.getRandomColor()}"
            stroke-width="${getRandomNumber(1, 20)}"
            fill="${this.getRandomColor()}"
            />
        </svg>`.replace(/\n/g, '');
    }

    private getRandomColor(): string {
        return getRandomElementFromArray(Colors);
    }

    private createSquare(): string {
        const size = getRandomNumber(5, 100);
        return this.createRect({ height: size, width: size });
    }

    private createTriangle(): string {
        const height = getRandomNumber(5, 100);
        const width = getRandomNumber(5, 100);
        const points: string[] = [];

        for (let i = 0; i < 3; i++) {
            points.push(`${getRandomNumber(0, width)},${getRandomNumber(0, height)}`);
        }

        return `<svg height="${height}" width="${width}">
            <polygon
            points="${points.join(' ')}"
            stroke="${this.getRandomColor()}"
            stroke-width="${getRandomNumber(1, 20)}"
            fill="${this.getRandomColor()}"
            />
        </svg>`.replace(/\n/g, '');
    }

}
export default RandomShapeSerivce;
