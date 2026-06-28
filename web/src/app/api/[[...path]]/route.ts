import { NextRequest, NextResponse } from 'next/server';

let app: any;

function createRequest(nextReq: NextRequest) {
  const url = new URL(nextReq.url);
  const headers: Record<string, string> = {};
  nextReq.headers.forEach((v, k) => { headers[k] = v; });

  return {
    method: nextReq.method,
    url: url.pathname + url.search,
    headers,
    body: undefined as any,
    _body: false,
    query: Object.fromEntries(url.searchParams.entries()),
    params: {} as Record<string, string>,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1),
    secure: url.protocol === 'https:',
    ip: headers['x-forwarded-for'] || headers['x-real-ip'] || '127.0.0.1',
    ips: [] as string[],
    subdomains: [] as string[],
    hostname: url.hostname,
    get(header: string) { return headers[header.toLowerCase()]; },
    header(header: string) { return headers[header.toLowerCase()]; },
    accepts() { return ''; },
    acceptsCharsets() { return []; },
    acceptsEncodings() { return []; },
    acceptsLanguages() { return []; },
    range() { return undefined; },
    fresh: false,
    stale: true,
    xhr: (headers['x-requested-with'] || '').toLowerCase() === 'xmlhttprequest',
    socket: { encrypted: url.protocol === 'https:' },
  };
}

function buildResponse(
  statusCode: number,
  statusMessage: string,
  headers: Record<string, string | string[]>,
  chunks: Buffer[],
): NextResponse {
  const body = chunks.length > 0 ? Buffer.concat(chunks) : null;
  const resHeaders = new Headers();
  for (const [k, v] of Object.entries(headers)) {
    if (Array.isArray(v)) { for (const vi of v) resHeaders.append(k, vi); }
    else { resHeaders.set(k, v); }
  }
  return new NextResponse(body, { status: statusCode, statusText: statusMessage, headers: resHeaders });
}

async function handleWithExpress(nextReq: NextRequest): Promise<NextResponse> {
  try {
    if (!app) {
      const { default: expressApp } = await import('../../../../backend/app.js');
      app = expressApp;
    }
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', error: { code: 'EXPRESS_INIT_FAILED', message: err?.message ?? String(err) } },
      { status: 500 },
    );
  }

  try {
    const body = nextReq.body ? await nextReq.text() : '';
    const req = createRequest(nextReq);
    if (body) {
      try { req.body = JSON.parse(body); req._body = true; }
      catch { req.body = body; }
    }

    return await new Promise<NextResponse>((resolve) => {
      let statusCode = 200;
      let statusMessage = 'OK';
      const headers: Record<string, string | string[]> = {};
      const chunks: Buffer[] = [];

      function setHeader(name: string, value: string | number | string[]) {
        headers[name.toLowerCase()] = Array.isArray(value) ? value.map(String) : String(value);
      }

      const timeout = setTimeout(() => {
        resolve(buildResponse(504, 'Gateway Timeout', { 'content-type': 'application/json' },
          [Buffer.from(JSON.stringify({ status: 'error', error: { code: 'TIMEOUT', message: 'Express handler timed out' } }))]));
      }, 25000);

      const res = {
        _chunks: chunks, _headers: headers,
        app: undefined as any, req: undefined as any, res: true,
        locals: {} as Record<string, any>,
        headersSent: false, writableEnded: false,
        get statusCode() { return statusCode; },
        set statusCode(v: number) { statusCode = v; },
        get statusMessage() { return statusMessage; },
        set statusMessage(v: string) { statusMessage = v; },
        writeHead(st: number, reason?: string | Record<string, string>, ha?: Record<string, string>) {
          statusCode = st;
          if (typeof reason === 'string') statusMessage = reason;
          else if (typeof reason === 'object') Object.assign(headers, reason);
          if (ha) Object.assign(headers, ha);
          this.headersSent = true;
          return this;
        },
        write(chunk: any) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        },
        end(chunk?: any) {
          clearTimeout(timeout);
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          resolve(buildResponse(statusCode, statusMessage, headers, chunks));
        },
        setHeader,
        getHeader(name: string) { return headers[name.toLowerCase()]; },
        getHeaders() { return { ...headers }; },
        removeHeader(name: string) { delete headers[name.toLowerCase()]; },
        hasHeader(name: string) { return name.toLowerCase() in headers; },
        json(body: any) {
          setHeader('content-type', 'application/json; charset=utf-8');
          chunks.push(Buffer.from(JSON.stringify(body)));
        },
        status(code: number) { statusCode = code; return this; },
        sendStatus(code: number) { statusCode = code; this.end(); },
        send(body: any) {
          if (typeof body === 'object' && body !== null) return this.json(body);
          chunks.push(Buffer.from(String(body ?? '')));
        },
        type(type: string) { setHeader('content-type', type); return this; },
        attachment() {},
        redirect(statusOrUrl: number | string, url?: string) {
          if (typeof statusOrUrl === 'number') { statusCode = statusOrUrl; setHeader('location', url!); }
          else { statusCode = 302; setHeader('location', statusOrUrl); }
        },
        cookie(name: string, value: string, options?: Record<string, any>) {
          let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
          if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
          if (options?.httpOnly) cookie += '; HttpOnly';
          if (options?.secure) cookie += '; Secure';
          if (options?.path) cookie += `; Path=${options.path}`;
          if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
          const existing = headers['set-cookie'] || [];
          headers['set-cookie'] = [...(Array.isArray(existing) ? existing : [existing]), cookie];
        },
        clearCookie(name: string) { this.cookie(name, '', { maxAge: 0 }); },
        append(field: string, val: string | string[]) {
          const k = field.toLowerCase();
          const existing = headers[k];
          headers[k] = existing
            ? [...(Array.isArray(existing) ? existing : [existing]), ...(Array.isArray(val) ? val : [val])]
            : (Array.isArray(val) ? val : [val]);
        },
        format() {}, vary() {}, links() {},
      };

      try {
        app(req, res);
      } catch (err: any) {
        clearTimeout(timeout);
        resolve(buildResponse(500, 'Internal Server Error', { 'content-type': 'application/json' },
          [Buffer.from(JSON.stringify({ status: 'error', error: { code: 'EXPRESS_ERROR', message: err?.message ?? String(err) } }))]));
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', error: { code: 'REQUEST_ERROR', message: err?.message ?? String(err) } },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) { return handleWithExpress(req); }
export async function POST(req: NextRequest) { return handleWithExpress(req); }
export async function PUT(req: NextRequest) { return handleWithExpress(req); }
export async function PATCH(req: NextRequest) { return handleWithExpress(req); }
export async function DELETE(req: NextRequest) { return handleWithExpress(req); }
export async function HEAD(req: NextRequest) { return handleWithExpress(req); }
export async function OPTIONS(req: NextRequest) { return handleWithExpress(req); }
