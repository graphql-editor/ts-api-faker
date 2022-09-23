import 'module-alias/register';

import { createResponse } from '@app/services/apiFaker';

import { buffer, createError } from 'micro';
import { ServerResponse, IncomingMessage, Server } from 'http';
import { gunzip } from 'zlib';
import { gzip, header } from './util';
import { run } from 'micro'

async function getBody(req: IncomingMessage): Promise<unknown> {
  let data = '';
  const body = await buffer(req, { limit: '10mb' });

  switch (req.headers['content-encoding']) {
    case 'gzip':
      data = await new Promise<string>((resolve, reject) => {
        gunzip(body, (err, buf) => {
          if (err) {
            reject(createError(400, 'Invalid gzip', err));
            return;
          }
          resolve(buf.toString());
        });
      });
      break;
    default:
      data = body.toString();
  }

  try {
    return JSON.parse(data);
  } catch (err) {
    throw createError(400, 'Invalid JSON', err);
  }
}

const serveFakeData = async (req: IncomingMessage, res: ServerResponse): Promise<unknown> => {
  if (((req || {}).method || '').toUpperCase() === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', `${3600 * 24}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', ['POST', 'OPTIONS'].join(','));
    res.setHeader(
      'Access-Control-Allow-Headers',
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
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return '';
  }

  const gzipResponse = header(req.headers, 'accept-encoding').find((v) => v === 'gzip');
  const data = await getBody(req);
  const body: string = createResponse(JSON.stringify(data));

  res.setHeader('content-type', 'application/json');
  if (gzipResponse) {
    res.setHeader('content-encoding', 'gzip');
  }
  return gzipResponse ? gzip(body) : body;
};

const srv = new Server((req, res) => run(req, res, serveFakeData));
srv.listen(3000, () => {
  console.log('Now listenning on port 3000');
});

const finish = () => {
  console.log('Gracefully shutting down');
  srv.close(() => {
    console.log('Exiting ....');
  });
}
process.on('SIGINT', finish)
process.on('SIGTERM', finish)
