import { gzip, header } from '../src/util';
import { InputType, CompressCallback } from 'zlib';

describe('util tests', () => {
  it('test header parser', () => {
    expect(header({ header: 'value1' }, 'header')).toEqual(['value1']);
    expect(header({ header: ['value1'] }, 'header')).toEqual(['value1']);
    expect(header({ header: 'value1,value2' }, 'header')).toEqual(['value1', 'value2']);
    expect(header({ header: ['value1', 'value2'] }, 'header')).toEqual(['value1', 'value2']);
  });
  it('test gzip function', async () => {
    await expect(gzip('data')).resolves.toBeTruthy();
    await expect(
      gzip('data', { gzip: (_: InputType, cb: CompressCallback) => cb(null, Buffer.from('data')) }),
    ).resolves.toEqual(Buffer.from('data'));
    await expect(
      gzip('data', { gzip: (_: InputType, cb: CompressCallback) => cb(new Error('error'), null) }),
    ).rejects.toEqual(new Error('error'));
  });
});
