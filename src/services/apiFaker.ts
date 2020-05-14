import * as faker from 'faker';

import { randomShape } from "@app/services/randomShape";
import { compare } from "@app/helpers/levenshtein";
import { isObject, isNumber, objectFromEntries, randomElementFromArray } from '@app/helpers/helpers';
import { keyMapObject, permittedFakerMethods, fakerExtension } from "@app/helpers/assets";


const allKeys: keyMapObject[] = permittedFakerMethods
    .map((permKey) => Object.keys(faker[permKey])
    .map((fakerMethod) => ({ name: `${permKey}.${fakerMethod}`, key: permKey, value: fakerMethod })))
    .reduce((a, b) => [...a, ...b]).concat(fakerExtension);


export function createResponse(parsedReq: string): string {
    let preparedData: object = JSON.parse(parsedReq);
    preparedData = passDecode(preparedData, fakeValue, 'static');
    preparedData = passRepeat(preparedData);

    if (!Array.isArray(preparedData)) {
        preparedData = passSettingsAndKeyDirective(preparedData);
        if (typeof preparedData['@settings']['root'] !== 'undefined'
        && preparedData['@settings']['root']
        && typeof preparedData[Object.keys(preparedData)[1]] === 'object') {
            preparedData = preparedData[Object.keys(preparedData)[1]];
        }
        delete preparedData['@settings'];
    }

    preparedData = passDecode(JSON.parse(JSON.stringify(preparedData)), fakeValue);
    return JSON.stringify(preparedData);
};

export function fakeValue(word: string): string {
    let data: string = word;
    if (data.length <= 0) {
        return data;
    }

    let [key, value, arg1, arg2]: string[] = data.match(/\w+/g);

    if (['data', 'key', 'use', 'svg'].includes(key)) {
        return data;
    }

    switch (key) {
        case 'shape':
            return randomShape(value);
        case 'image':
        case 'photo':
        case 'picture':
            key = 'image';
            if (typeof faker[key][value] !== 'undefined') {
                break;
            }
            return resolveImages((value || 'image'), parseInt((arg1 || '200')), parseInt((arg2 || '200')));
        case 'gender':
            return randomElementFromArray(['male', 'female', 'unset']);
        case 'date':
            if (typeof faker[key][value] !== 'undefined') {
                break;
            }
            return randomDate();
        default:
            break;
    }

    //? pipes ex.date format

    if (typeof faker[key] !== 'undefined' && typeof faker[key][value] !== 'undefined') {
        let output = faker[key][value](arg1,arg2);
        return output;
    }

    if (!(typeof faker[key] !== 'undefined' && typeof faker[key][value] !== 'undefined') &&
        (/^\w+\D(\.)\w+\D$/).test(data)) {
        return fakeValue(compare(`${key}.${value}`, allKeys));
    }

    return data;
};

function passDecode(obj: object, fakerFunc: CallableFunction, directive?: string): object {
    let data = obj;
    const decoder = fakerFunc;
    const dir = directive || '';
    let pattern: RegExp = /\'\'/g;
    dir !== '' ? pattern = new RegExp(`@(${dir}:?)`, 'g'): null;
    for (const key in data) {
        if(typeof data[key] === 'string' && data[key].includes(dir)) {
            pattern !== /\'\'/g ?
            data[key] = data[key].replace(pattern, ''): null;
            data[key] = decoder(data[key]);
        }
        Array.isArray(data[key]) || isObject(data[key]) ? passDecode(data[key], decoder, dir) : null;
    }
    return data;
};

function passRepeat <T> (obj: object | Array<T>): object {
    let data = obj;
    for (const key in data) {
        if (typeof data[key] === 'string' && data[key].includes('@repeat')) {
            data[key] = data[key].replace(/@(repeat:?)/g, '');
            let rep: string = data[key];
            if (data[key].includes(',')) {
                //? 2nd
                // rep = rep.split(',').find(el => isNumber(el));
                // data[key] = data[key].replace(rep, '').replace(/\,/g, '');
                rep = rep.match(/\w+/g).find(el => isNumber(el));
                data[key] = data[key].replace(/\d,?/g, '');
                for (let i = 0; i < parseInt(rep); i++) {
                    Array.isArray(data) ? data.push(data[key]) : null;
                }
            } else {
                Array.isArray(data) ? data.splice(data.indexOf(data[key]), 1) : null;
                for (let i = 0; i < parseInt(rep); i++) {
                    Array.isArray(data) ? data.push(data[data.length - 1]) : null;
                }
            }
        }
        Array.isArray(data[key]) || isObject(data[key]) ? passRepeat(data[key]) : null;
    }
    return data;
};

function passSettingsAndKeyDirective(obj: object, parent?: object): object {
    let data = obj;
    const parentData = parent || obj;
    if (typeof parentData['data'] || parentData['definitions'] !== 'undefined') {
       for (const key in data) {

            //? @key directive
            if (isObject(data[key])) {
                data[key] = objectFromEntries(Object.entries<string>(data[key]).map(([keys, val]) => {
                    typeof val === 'string' && val.trim() === '@key' ?
                    val = faker[keys][randomElementFromArray(Object.keys(faker[keys]))](): null;
                    return [keys, val];
                }));
            }

            if(typeof data[key] === 'string' && (/@(use|data):?/g).test(data[key])) {
                let entries: Array<string> = data[key].match(/\w+/g);
                let entry: string = '';

                //? @data directive
                if ((/@(data):?/g).test(data[key])) {
                    entry = entries.find(el => (/^data/).test(el));
                    entries.splice(entries.indexOf(entry), 1);
                    let startingPoint = parentData['@settings'][entry];
                    let result: string | object = '';
                    entries.map(el => {
                        if (typeof startingPoint[el] !== 'undefined') {
                            return result = startingPoint[el];
                        }

                        if(typeof result[el] !== 'undefined') {
                            return result = result[el];
                        }
                    });
                    data[key] = result;
                }

                //? @use directive | entry = for future purposes
                if ((/@(use):?/g).test(data[key])) {
                    entry = entries.find(el => (/^use/).test(el));
                    entries.splice(entries.indexOf(entry), 1);
                    data[key] = parentData['@settings']['definitions'][entries.map(el => el)];
                }
            }
            Array.isArray(data[key]) || isObject(data[key]) ? passSettingsAndKeyDirective(data[key], parentData) : null;
        }
    }
    return data;
}

function randomDate(): string {
    const now = new Date();
    const helper = new Date(2012, 0, 1);
    return new Date(helper.getTime() + Math.random() * (now.getTime() - helper.getTime())).toISOString();
};

function resolveImages (name: string, width: number, height: number): string {
    return `https://source.unsplash.com/${width}x${height}/?${name}`;
};
