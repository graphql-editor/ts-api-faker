import { createResponse, fakeValue } from '../../src/services/apiFaker';

describe('apiFaker tests', () => {
  it('generates fake data', () => {
    const sample1 = { name: '@key' };
    const sample2 = [
      {
        name: '@key',
        date: '@key',
        num: 'random.number',
      },
      '@repeat:1',
    ];
    type output2 = [{ name: string; date: string; num: number }, { name: string; date: string; num: number }];
    const sample3 = {
      '@settings': {
        data: {
          name: 'Alice',
          nested: {
            one: {
              two: {
                three: 'value',
              },
            },
          },
        },
        definitions: {
          customer: {
            createdAt: 'date@static',
            name: 'nam.firstNae',
            surname: 'name.lstNme',
            gender: 'gender',
            avatar: 'shpe.circ',
            squareField: 'shape.square',
            rectField: 'shap.rectangle',
            triangleField: 'shape.triangle',
            image: 'photo.girl.640.480',
          },
        },
        root: true,
      },
      out: [
        {
          company: 'company.companyName',
          address: {
            street: 'address.streetName',
            zipcode: 'addre.zipCode',
            country: 'adess.country@static',
          },
          nameFromData: '@data:name',
          valueFromNested: 'nested.one.two.three@data',
          nullProperty: null,
          customers: ['@use:customer,@repeat:1'],
        },
      ],
    };

    const desiredOutputSample3 = [
      {
        company: expect.stringMatching(/^((?!company.companyName).)*$/s),
        address: {
          street: expect.stringMatching(/^((?!address.streetName).)*$/s),
          zipcode: expect.stringMatching(/^((?!addre.zipCode).)*$/s),
          country: expect.stringMatching(/^((?!adess.country@static).)*$/s),
        },
        nameFromData: expect.stringContaining('Alice'),
        valueFromNested: expect.stringContaining('value'),
        customers: [
          {
            createdAt: expect.stringMatching(/\d+\W+/),
            name: expect.stringMatching(/^((?!nam.firstNae).)*$/s),
            surname: expect.stringMatching(/^((?!name.lstNme).)*$/s),
            gender: expect.stringMatching(/male|female|unset/),
            avatar: expect.stringMatching(/^<svg [^>]*>[\s]*<circle [^>]*\/>[\s]*<\/svg>/),
            squareField: expect.stringMatching(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/),
            rectField: expect.stringMatching(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/),
            triangleField: expect.stringMatching(/^<svg [^>]*>[\s]*<polygon [^>]*\/>[\s]*<\/svg>/),
            image: expect.stringContaining('https://source.unsplash.com/640x480/?girl'),
          },
          {
            createdAt: expect.stringMatching(/\d+\W+/),
            name: expect.stringMatching(/^((?!nam.firstNae).)*$/s),
            surname: expect.stringMatching(/^((?!name.lstNme).)*$/s),
            gender: expect.stringMatching(/male|female|unset/),
            avatar: expect.stringMatching(/^<svg [^>]*>[\s]*<circle [^>]*\/>[\s]*<\/svg>/),
            squareField: expect.stringMatching(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/),
            rectField: expect.stringMatching(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/),
            triangleField: expect.stringMatching(/^<svg [^>]*>[\s]*<polygon [^>]*\/>[\s]*<\/svg>/),
            image: expect.stringContaining('https://source.unsplash.com/640x480/?girl'),
          },
        ],
      },
    ];

    const faked1 = JSON.parse(createResponse(JSON.stringify(sample1)));
    const faked2 = JSON.parse(createResponse(JSON.stringify(sample2)));
    const faked3 = JSON.parse(createResponse(JSON.stringify(sample3)));
    expect(faked1.name).toMatch(/^((?!@key).)*$/s);
    expect(faked2).toMatchObject<output2>(faked2);
    expect(faked3).toMatchObject(desiredOutputSample3);
  });

  it('faker function test', () => {
    const exImage = 'https://source.unsplash.com/640x480/?girl';
    expect(fakeValue('')).toMatch('');
    expect(fakeValue('address.country')).toMatch(/^((?!address.country).)*$/s);
    expect(fakeValue('nae.fndam')).toMatch(/^((?!name.findName).)*$/s);
    expect(['male', 'female', 'unset']).toContain(fakeValue('gender'));
    expect(typeof fakeValue('random.number') === 'number').toBeTruthy();
    expect(typeof fakeValue('random.boolean') === 'boolean').toBeTruthy();
    expect(typeof fakeValue('company.suffixes') === 'object').toBeTruthy();
    expect(fakeValue('@data:name')).toStrictEqual('@data:name');
    expect(fakeValue('@use:photo')).toStrictEqual('@use:photo');
    expect(fakeValue('@key')).toStrictEqual('@key');
    expect(fakeValue('<svg></svg>')).toStrictEqual('<svg></svg>');
    expect(fakeValue('image.girl.640.480')).toStrictEqual(exImage);
    expect(fakeValue('photo.girl.640.480')).toStrictEqual(exImage);
    expect(fakeValue('picture.girl.640.480')).toStrictEqual(exImage);
    expect(fakeValue('image.girl')).toStrictEqual('https://source.unsplash.com/200x200/?girl');
    expect(fakeValue('image')).toStrictEqual('https://source.unsplash.com/200x200/?image');
    expect(fakeValue('image.imageUrl')).toMatch(/lorempixel/);
    expect(fakeValue('date.month')).toMatch(/^((?!date.month).)*$/s);
  });
});
