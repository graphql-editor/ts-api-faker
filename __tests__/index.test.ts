import micro from 'micro';
import handler from '../src';
import { request, IncomingHttpHeaders } from 'http';
import { gzip, gunzip } from 'zlib';

describe('test micro integration', () => {
  const server = micro(handler);
  beforeAll(
    async (done): Promise<unknown> => {
      await new Promise((resolve) => {
        server.listen(3000, () => {
          resolve();
        });
      });
      done();
      return;
    },
  );
  afterAll(() => {
    server.close();
  });
  const makeRequest = ({
    body,
    encoding,
    method,
    acceptEncoding,
  }: {
    body?: string | Buffer;
    encoding?: string;
    method?: string;
    acceptEncoding?: string | string[];
  }): Promise<{ data: Buffer; headers: IncomingHttpHeaders; statusCode: number }> =>
    new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: 'localhost',
          port: 3000,
          method: method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(encoding && { 'Content-Encoding': encoding }),
            ...(acceptEncoding && { 'accept-encoding': acceptEncoding }),
          },
        },
        (resp) => {
          let data = Buffer.from('');
          resp.on('data', (chunk) => {
            data = Buffer.concat([data, Buffer.from(chunk)]);
          });
          resp.on('error', (e) => reject(e));
          resp.on('end', () =>
            resolve({
              statusCode: resp.statusCode || 0,
              headers: resp.headers,
              data,
            }),
          );
        },
      );
      req.on('error', (e) => reject(e));
      if (body) {
        req.write(body);
      }
      req.end();
    });
  it('handles raw json', async () => {
    const resp = await makeRequest({
      body: JSON.stringify({
        '@settings': {
          data: {
            mock: 'mockdata',
          },
          root: true,
        },
        out: '@data:mock',
      }),
    });
    expect(resp.data.toString()).toEqual('"mockdata"');
    expect(resp.headers['content-type']).toEqual('application/json');
    expect(resp.statusCode).toEqual(200);
  });
  it('bad request on malformed json', async () => {
    const resp = await makeRequest({
      body: 'notreallyajson',
    });
    expect(resp.data.toString()).toEqual('Invalid JSON');
    expect(resp.statusCode).toEqual(400);
  });
  it('handles gzipped json', async () => {
    const body = await new Promise<Buffer>((resolve, reject) =>
      gzip(
        JSON.stringify({
          '@settings': {
            data: {
              mock: 'mockdata',
            },
            root: true,
          },
          out: '@data:mock',
        }),
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        },
      ),
    );
    const resp = await makeRequest({ body, encoding: 'gzip' });
    expect(resp.data.toString()).toEqual('"mockdata"');
    expect(resp.headers['content-type']).toEqual('application/json');
    expect(resp.statusCode).toEqual(200);
  });
  it('bad request on invalid gzip', async () => {
    const resp = await makeRequest({ body: 'notreallyagzip', encoding: 'gzip' });
    expect(resp.data.toString()).toEqual('Invalid gzip');
    expect(resp.statusCode).toEqual(400);
  });
  it('responds with gzip', async () => {
    const resp = await makeRequest({
      body: JSON.stringify({
        '@settings': {
          data: {
            mock: 'mockdata',
          },
          root: true,
        },
        out: '@data:mock',
      }),
      acceptEncoding: 'gzip,deflate',
    });
    expect(resp.headers['content-type']).toEqual('application/json');
    expect(resp.headers['content-encoding']).toEqual('gzip');
    const data: object = await new Promise((resolve, reject) =>
      gunzip(resp.data, (err, body) => (err ? reject(err) : resolve(body))),
    );
    expect(data.toString()).toEqual('"mockdata"');
    expect(resp.statusCode).toEqual(200);
  });
  it('accepts preflight', async () => {
    const resp = await makeRequest({ method: 'OPTIONS' });
    expect(resp.headers['access-control-max-age']).toEqual(`${3600 * 24}`);
    expect(resp.headers['access-control-allow-origin']).toEqual('*');
    expect(resp.headers['access-control-allow-methods']).toEqual(['POST', 'OPTIONS'].join(','));
    expect(resp.headers['access-control-allow-headers']).toEqual(
      [
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'X-HTTP-Method-Override',
        'Content-Type',
        'Content-Encoding',
        'Authorization',
        'Accept',
      ].join(','),
    );
    expect(resp.headers['access-control-allow-credentials']).toEqual('true');
    expect(resp.statusCode).toEqual(200);
  });
});
