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

  const authHeader = req.headers.get('authorization');
  if (authHeader === expected) {
    return next();
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="rundosolar preview", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=UTF-8',
      // 诊断头（仅显示长度，不泄漏值）
      'x-debug-user-len': String(process.env.PREVIEW_USER?.length ?? 0),
      'x-debug-pass-len': String(process.env.PREVIEW_PASS?.length ?? 0),
      'x-debug-has-header': String(!!authHeader),
    },
  });
}
