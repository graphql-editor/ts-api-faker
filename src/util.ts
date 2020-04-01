import { IncomingHttpHeaders } from 'http';
import { gzip as _gzip, InputType, CompressCallback } from 'zlib';
export function header(headers: IncomingHttpHeaders, key: string): string[] {
  const header = headers[key];
  if (!header || header.length === 0) {
    return [];
  }
  return (Array.isArray(header) ? header : header.split(',')).map((v) => v.trim());
}
export const gzip = async (
  data: string,
  { gzip }: { gzip: (data: InputType, cb: CompressCallback) => void } = { gzip: _gzip },
): Promise<Buffer> => new Promise((resolve, reject) => gzip(data, (err, body) => (err ? reject(err) : resolve(body))));
