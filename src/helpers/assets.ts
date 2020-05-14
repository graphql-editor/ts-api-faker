export type keyMapObject = {
    name: string;
    key: string;
    value: string;
};

export const colors: Array<string> = [
    'red',
    '#00ff00',
    'rgb(0, 0, 255)',
    'rgba(0, 255, 200, 0.5)'
];

export const permittedFakerMethods: Array<string> = [
    'address',
    'commerce',
    'company',
    'database',
    'date',
    'finance',
    'hacker',
    'helpers',
    'internet',
    'lorem',
    'name',
    'phone',
    'random',
    'system',
];

export const fakerExtension: keyMapObject[] = [
    {
        name: 'image',
        value: 'image',
        key: 'image',
    },
    {
        name: 'gender',
        value: 'gender',
        key: 'gender',
    },
    {
        name: 'shape.circle',
        key: 'shape',
        value: 'circle',
    },
    {
        name: 'shape.square',
        key: 'shape',
        value: 'square',
    },
    {
        name: 'shape.triangle',
        key: 'shape',
        value: 'triangle',
    },
    {
        name: 'shape.rectangle',
        key: 'shape',
        value: 'rectangle',
    },
];
