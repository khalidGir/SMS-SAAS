import { NextRequest, NextResponse } from 'next/server';

// ---------- Minimal Express requirement detection ----------
let _expressReady = false;
let _expressError: string | null = null;
let app: any;

async function initExpress(): Promise<boolean> {
  if (_expressReady) return true;
  if (_expressError) return false;
  try {
    const { default: expressApp } = await import('../../../../backend/app.js');
    app = expressApp;
    _expressReady = true;
    return true;
  } catch (err: any) {
    _expressError = err?.message ?? String(err);
    console.error('Express init failed:', err);
    return false;
  }
}

// ---------- Bridge: Web API → Node req/res ----------

function toNodeReq(nextReq: NextRequest) {
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
    ips: [],
    subdomains: [],
    hostname: url.hostname,
    get(h: string) { return headers[h.toLowerCase()]; },
    header(h: string) { return headers[h.toLowerCase()]; },
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

// ---------- The main handler ----------

async function handle(nextReq: NextRequest): Promise<NextResponse> {
  // Health check — guarantees the Route Handler itself works
  if (nextReq.nextUrl.pathname === '/api/v1/health') {
    const ok = await initExpress();
    return NextResponse.json({
      status: 'ok',
      expressLoaded: ok,
      expressError: _expressError,
      timestamp: new Date().toISOString(),
    });
  }

  // Initialize Express on first real request
  const ready = await initExpress();
  if (!ready) {
    return NextResponse.json(
      { status: 'error', error: { code: 'EXPRESS_INIT_FAILED', message: _expressError } },
      { status: 500 },
    );
  }

  // Read body
  let rawBody = '';
  try { rawBody = nextReq.body ? await nextReq.text() : ''; } catch { /* ignore */ }

  // Build Node.js-like request
  const req = toNodeReq(nextReq);
  if (rawBody) {
    try { req.body = JSON.parse(rawBody); req._body = true; }
    catch { req.body = rawBody; }
  }

  // Run Express and wait for response
  return new Promise<NextResponse>((resolve) => {
    let statusCode = 200;
    let statusMessage = 'OK';
    const resHeaders: Record<string, string | string[]> = {};
    const chunks: Buffer[] = [];

    function r() {
      const body = chunks.length > 0 ? Buffer.concat(chunks) : null;
      const h = new Headers();
      for (const [k, v] of Object.entries(resHeaders)) {
        if (Array.isArray(v)) { for (const vi of v) h.append(k, vi); }
        else { h.set(k, v); }
      }
      resolve(new NextResponse(body, { status: statusCode, statusText: statusMessage, headers: h }));
    }

    const timeout = setTimeout(() => {
      resolve(NextResponse.json(
        { status: 'error', error: { code: 'TIMEOUT', message: 'Express did not respond within 25s' } },
        { status: 504 },
      ));
    }, 25000);

    const nodeRes: any = {
      _chunks: chunks, _headers: resHeaders,
      app: undefined, req: undefined, res: true,
      locals: {},
      headersSent: false, writableEnded: false,
      get statusCode() { return statusCode; },
      set statusCode(v: number) { statusCode = v; },
      get statusMessage() { return statusMessage; },
      set statusMessage(v: string) { statusMessage = v; },
      writeHead(st: number, reason?: string | Record<string, string>, ha?: Record<string, string>) {
        statusCode = st;
        if (typeof reason === 'string') statusMessage = reason;
        else if (typeof reason === 'object') Object.assign(resHeaders, reason);
        if (ha) Object.assign(resHeaders, ha);
        this.headersSent = true;
        return this;
      },
      write(c: any) { chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)); return true; },
      end(c?: any) {
        clearTimeout(timeout);
        if (c) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
        r();
      },
      setHeader(name: string, v: string | number | string[]) {
        resHeaders[name.toLowerCase()] = Array.isArray(v) ? v.map(String) : String(v);
      },
      getHeader(name: string) { return resHeaders[name.toLowerCase()]; },
      getHeaders() { return { ...resHeaders }; },
      removeHeader(name: string) { delete resHeaders[name.toLowerCase()]; },
      hasHeader(name: string) { return name.toLowerCase() in resHeaders; },
      json(body: any) {
        this.setHeader('content-type', 'application/json; charset=utf-8');
        chunks.push(Buffer.from(JSON.stringify(body)));
      },
      status(code: number) { statusCode = code; return this; },
      sendStatus(code: number) { statusCode = code; this.end(); },
      send(body: any) {
        if (typeof body === 'object' && body !== null) return this.json(body);
        chunks.push(Buffer.from(String(body ?? '')));
      },
      type(t: string) { this.setHeader('content-type', t); return this; },
      attachment() {},
      redirect(s: number | string, u?: string) {
        if (typeof s === 'number') { statusCode = s; this.setHeader('location', u!); }
        else { statusCode = 302; this.setHeader('location', s); }
      },
      cookie(name: string, value: string, opts?: Record<string, any>) {
        let c = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        if (opts?.maxAge) c += `; Max-Age=${opts.maxAge}`;
        if (opts?.httpOnly) c += '; HttpOnly';
        if (opts?.secure) c += '; Secure';
        if (opts?.path) c += `; Path=${opts.path}`;
        if (opts?.sameSite) c += `; SameSite=${opts.sameSite}`;
        const e = resHeaders['set-cookie'] || [];
        resHeaders['set-cookie'] = [...(Array.isArray(e) ? e : [e]), c];
      },
      clearCookie(name: string) { this.cookie(name, '', { maxAge: 0 }); },
      append(field: string, val: string | string[]) {
        const k = field.toLowerCase();
        const e = resHeaders[k];
        resHeaders[k] = e
          ? [...(Array.isArray(e) ? e : [e]), ...(Array.isArray(val) ? val : [val])]
          : (Array.isArray(val) ? val : [val]);
      },
      format() {}, vary() {}, links() {},
    };

    try {
      app(req, nodeRes);
    } catch (err: any) {
      clearTimeout(timeout);
      resolve(NextResponse.json(
        { status: 'error', error: { code: 'EXPRESS_CRASH', message: err?.message ?? String(err) } },
        { status: 500 },
      ));
    }
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
