import micro from 'micro';
import handler from '../src';
import { request, IncomingHttpHeaders } from 'http';
import { gzip } from 'zlib';

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
  }: {
    body?: string | Buffer;
    encoding?: string;
    method?: string;
  }): Promise<{ data: unknown; headers: IncomingHttpHeaders; statusCode: number }> =>
    new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: 'localhost',
          port: 3000,
          method: method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(encoding && { 'Content-Encoding': encoding }),
          },
        },
        (resp) => {
          let data = '';
          resp.on('data', (chunk) => {
            data += chunk.toString();
          });
          resp.on('error', (e) => reject(e));
          resp.on('end', () =>
            resolve({
              statusCode: resp.statusCode,
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
      body: JSON.stringify({ raw: 'mockdata' }),
    });
    expect(resp.data).toEqual('mockdata');
    expect(resp.statusCode).toEqual(200);
  });
  it('bad request on malformed json', async () => {
    const resp = await makeRequest({
      body: 'notreallyajson',
    });
    expect(resp.data).toEqual('Invalid JSON');
    expect(resp.statusCode).toEqual(400);
  });
  it('handles gzipped json', async () => {
    const body = await new Promise<Buffer>((resolve, reject) =>
      gzip(JSON.stringify({ raw: 'mockdata' }), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }),
    );
    const resp = await makeRequest({ body, encoding: 'gzip' });
    expect(resp.data).toEqual('mockdata');
    expect(resp.statusCode).toEqual(200);
  });
  it('bad request on invalid gzip', async () => {
    const resp = await makeRequest({ body: 'notreallyagzip', encoding: 'gzip' });
    expect(resp.data).toEqual('Invalid gzip');
    expect(resp.statusCode).toEqual(400);
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
