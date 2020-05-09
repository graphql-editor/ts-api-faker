import * as faker from 'faker';


import { isArray, isObject, objectFromEntries, isNumber } from '@app/helpers/helpers';
import RandomShapeService from '@app/services/RandomShapeService';

const shape = new RandomShapeService();

export function createResponse(parsedReq: string): string {

    const data: object = JSON.parse(parsedReq);
    let preparedData: object = {};
    preparedData = passDecode(data, fakeValue, 'static'); //? 1. PASS
    preparedData = passRepeat(preparedData);//? 2. SEC PASS
    !Array.isArray(data) ?
    preparedData = passFillFromSettings(preparedData): null; //? 3. fill from settings
    preparedData = passDecode(JSON.parse(JSON.stringify(preparedData)), fakeValue); //? 4. rest

    return JSON.stringify(preparedData);
};

function passDecode(obj: object, decoder: CallableFunction, directive?: string): object {
    let data  = obj;
    let dec = decoder;
    const dir = directive || '';
    let pattern: RegExp = /\'\'/g;
    dir !== '' ? pattern = new RegExp(`@(${dir}:?)`, 'g'): null;
    for (let key in data) {
        if(typeof data[key] === 'string' && data[key].includes(dir)) {
            pattern !== /\'\'/g ?
            data[key] = data[key].replace(pattern, ''): null;
            data[key] = dec(data[key]);
        }
        isArray(data[key]) || isObject(data[key]) ? passDecode(data[key], dec, dir) : null;
    }
    return data;
};

//? REPEAT NIGDY NIE DEKODUJE!!
function passRepeat <T> (obj: object | Array<T>): object {
    let data = obj;
    for (let key in data) {
        if (typeof data[key] === 'string' && data[key].includes('@repeat')) {
            data[key] = data[key].replace(/@(repeat:?)/g, '');
            let rep: string = data[key];
            if (data[key].includes(',')) {
                rep = rep.split(',').find(el => isNumber(el));
                data[key] = data[key].replace(rep, '').replace(/\,/g, '');
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
        isArray(data[key]) || isObject(data[key]) ? passRepeat(data[key]) : null;
    }
    return data;
};

function passFillFromSettings(obj: object, parent?: object): object {
    let data = obj;
    const parentData = parent || obj;
    if (typeof parentData['data'] || parentData['definitions'] !== 'undefined') {
       // 1. trawers po zmiennych
       // 2. podstawienie danych z klucza i malucha
       for (let key in data) {

            if (isObject(data[key])) {
                // console.log(data[key]);
            }

            // && data[key].includes(('@data' || '@use'))
            if(typeof data[key] === 'string') {
                // pattern !== /\'\'/g ?
                // data[key] = data[key].replace(pattern, ''): null;
                // data[key] = decoder(data[key]);
                // console.log(data[key]);
                // console.log(parentData);
            }
            isArray(data[key]) || isObject(data[key]) ? passFillFromSettings(data[key], parentData) : null;
        }
    }
    return data;
}

function fakeValue(word: string): string {
    let data: string = word;
    let pipe: string = '';
    let [key, value, arg1, arg2] = data.match(/\w+/g);

    //? optionally
    if (['data', 'key', 'use', 'svg'].includes(key)) {
        return data;
    }

    //?internal match
    switch (key) {
        case 'shape':
            return shape.getRandomShape(value);
        case 'image':
            if (typeof faker[key][value.trim()] !== 'undefined') {
                break;
            }
            return resolveImages((value || 'image'), parseInt((arg1 || '200')), parseInt((arg2 || '200')));
        case 'gender':
            return randomGender();
        case 'date':
            if (typeof faker[key][value.trim()] !== 'undefined') {
                break;
            }
            return randomDate()
        default:
            break;
    }

    //? future purposes 2 parameters in value ex. "key": "address.streetName @data:name"
    // if (value.includes(' ')) {
    //     console.log(value.split(/\s/g));
    // }

    //? pipes date format
    if (typeof value !== 'undefined' && value.includes('|')) {
        const pipes = value.split('|');
        value = pipes[0];
        pipe  = pipes[1];
    }

    //? standard
    if (typeof faker[key] !== 'undefined' && typeof faker[key][value.trim()] !== 'undefined') {
        let output = faker[key][value](arg1,arg2);
        if (pipe !== '') {
            //? use pipe dekoder
            //? output = pipe(output); -> string
        }
        return output;
    }

    return data;
};

function resolveImages (name: string, width: number, height: number): string {
    return `https://source.unsplash.com/${width}x${height}/?${name}`;
};

function randomGender (): string {
    const genders = ['male', 'female', 'unset'];
    return genders[Math.floor(Math.random() * genders.length)];
};

function randomDate(): string {
    const now = new Date();
    const helper = new Date(2012, 0, 1);
    return new Date(helper.getTime() + Math.random() * (now.getTime() - helper.getTime())).toISOString();
}
