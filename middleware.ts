// Vercel Edge Middleware: HTTP Basic Auth（可选）
//
// 在 Vercel Dashboard → Project Settings → Environment Variables 里配置：
//   PREVIEW_USER  比如 demo
//   PREVIEW_PASS  比如 pvdemo2026
// 不配置时默认 admin / changeme（生产务必覆盖）
//
// 不想要密码保护可直接删掉本文件。

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

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="rundosolar preview", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
