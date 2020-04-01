import { buffer, createError } from 'micro';
import { ServerResponse, IncomingMessage } from 'http';
import { gunzip } from 'zlib';
import { RValueOrArrayValue, iterateAllValuesFaker } from './fake';
import { gzip, header } from './util';

async function getBody(req: IncomingMessage): Promise<RValueOrArrayValue> {
  const body = await buffer(req, { limit: '10mb' });
  let data: string;
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
  if (req.method.toUpperCase() === 'OPTIONS') {
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
  const body = JSON.stringify(iterateAllValuesFaker(await getBody(req)));
  res.setHeader('content-type', 'application/json');
  if (gzipResponse) {
    res.setHeader('content-encoding', 'gzip');
  }
  return gzipResponse ? gzip(body) : body;
};

export default serveFakeData;
