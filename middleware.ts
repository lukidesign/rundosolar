// Vercel Edge Middleware: HTTP Basic Auth
// 在 Vercel Dashboard 的 Project Settings → Environment Variables 里配置：
//   PREVIEW_USER  比如 demo
//   PREVIEW_PASS  比如 pvdemo2026
// 不配置时默认 admin / changeme（生产上请务必配置覆盖）

import { next } from '@vercel/edge';

export const config = {
  matcher: '/((?!_next|favicon.ico|icons).*)',
};

export default function middleware(req: Request) {
  const user = process.env.PREVIEW_USER || 'admin';
  const pass = process.env.PREVIEW_PASS || 'changeme';
  const expected = 'Basic ' + btoa(`${user}:${pass}`);

  const authHeader = req.headers.get('authorization') || '';
  if (authHeader === expected) {
    return next();
  }

  // 把诊断信息放在响应体里（headers 会被 Vercel 过滤）
  const diag = [
    'Authentication required',
    '',
    'DEBUG (will be removed once verified):',
    `  PREVIEW_USER set: ${!!process.env.PREVIEW_USER}  len=${(process.env.PREVIEW_USER || '').length}`,
    `  PREVIEW_PASS set: ${!!process.env.PREVIEW_PASS}  len=${(process.env.PREVIEW_PASS || '').length}`,
    `  user (effective): ${user}`,
    `  authHeader present: ${!!authHeader}  len=${authHeader.length}`,
    `  authHeader prefix: ${authHeader.slice(0, 6)}`,
    `  expected prefix: ${expected.slice(0, 6)}`,
    `  match: ${authHeader === expected}`,
    `  build tag: v3`,
  ].join('\n');

  return new Response(diag, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="rundosolar preview", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
