import { iterateAllValuesFaker } from '../src/fake';

describe('faker', () => {
  const imageVal = ({ name, width, height }: { name: string; width: number; height: number }): string =>
    `https://source.unsplash.com/${width}x${height}/?${name}`;
  it('generates fake data', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faked: any = iterateAllValuesFaker({
      fields: {
        rawField: {
          raw: 'mockdata',
        },
        circleField: {
          fake: 'shape.circle',
        },
        squareField: {
          fake: 'shape.square',
        },
        rectField: {
          fake: 'shape.rectangle',
        },
        triangleField: {
          fake: 'shape.triangle',
        },
        genderField: {
          fake: 'gender',
        },
        dateField: {
          fake: 'date',
        },
        imageField: {
          fake: 'image',
        },
        namedImageField: {
          fake: 'image.name',
        },
        named100ImageField: {
          fake: 'image.name.100',
        },
        named100x50ImageField: {
          fake: 'image.name.100.50',
        },
        named100x50PhotoField: {
          fake: 'photo.name.100.50',
        },
        named100x50PictureField: {
          fake: 'picture.name.100.50',
        },
        dataURIImageField: {
          fake: 'image.dataUri',
        },
        email: {
          // check if field name is used as a hint for generation
          fake: 'string',
        },
        nullValue: null,
        arrayOfValues: [
          { raw: 'mockdata' },
          [{ raw: 'mockdata' }, { raw: 'mockdata' }],
          [
            [{ raw: 'mockdata' }, { raw: 'mockdata' }],
            [{ raw: 'mockdata' }, { raw: 'mockdata' }],
          ],
        ],
      },
    });
    expect(faked.rawField).toEqual('mockdata');
    expect(faked.circleField).toMatch(/^<svg [^>]*>[\s]*<circle [^>]*\/>[\s]*<\/svg>/);
    expect(faked.squareField).toMatch(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/);
    expect(faked.rectField).toMatch(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/);
    expect(faked.triangleField).toMatch(/^<svg [^>]*>[\s]*<polygon [^>]*\/>[\s]*<\/svg>/);
    expect(['male', 'female', 'unset']).toContain(faked.genderField);
    expect(isNaN(new Date(faked.dateField).getTime())).toBeFalsy();
    expect(faked.imageField).toEqual(imageVal({ name: 'imageField', width: 200, height: 200 }));
    expect(faked.namedImageField).toEqual(imageVal({ name: 'name', width: 200, height: 200 }));
    expect(faked.namedImageField).toEqual(imageVal({ name: 'name', width: 200, height: 200 }));
    expect(faked.named100ImageField).toEqual(imageVal({ name: 'name', width: 100, height: 100 }));
    expect(faked.named100x50ImageField).toEqual(imageVal({ name: 'name', width: 100, height: 50 }));
    expect(faked.named100x50PhotoField).toEqual(imageVal({ name: 'name', width: 100, height: 50 }));
    expect(faked.named100x50PictureField).toEqual(imageVal({ name: 'name', width: 100, height: 50 }));
    expect(faked.dataURIImageField).toMatch(/^data:image/);
    expect(faked.email).toMatch(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
    expect(faked.nullValue).toBeNull();
    expect(faked.arrayOfValues).toEqual([
      'mockdata',
      ['mockdata', 'mockdata'],
      [
        ['mockdata', 'mockdata'],
        ['mockdata', 'mockdata'],
      ],
    ]);
  });
  it('test unkeyed values generation', () => {
    const faked = iterateAllValuesFaker([{ fake: 'string' }, { fake: 'image' }]) as Array<unknown>;
    expect(faked.length).toEqual(2);
    expect(faked[0]).toBeTruthy();
    expect(typeof faked[0] === 'string').toBeTruthy();
    expect(faked[1]).toEqual(imageVal({ name: 'image', width: 200, height: 200 }));
  });
  it('generates invalid hint for fake field', () => {
    expect(() => {
      const faked = iterateAllValuesFaker({ fake: 'invalid' }) as string;
      expect(faked).toEqual('<<field could not be faked, reason: invalid is not a valid faker value>>');
    }).not.toThrow();
  });
  it('test type generators', () => {
    expect(typeof iterateAllValuesFaker({ fake: 'random.number' }) === 'number').toBeTruthy();
    expect(typeof iterateAllValuesFaker({ fake: 'random.boolean' }) === 'boolean').toBeTruthy();
    expect(typeof iterateAllValuesFaker({ fake: 'random.uuid' }) === 'string').toBeTruthy();
  });
});
