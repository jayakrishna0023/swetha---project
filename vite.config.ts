import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

// Serves the Vercel functions in /api during local development, so `npm run dev`
// behaves like the deployed site without running a separate server.
function localApi(): Plugin {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();
        const route = url.slice(5).split('?')[0];
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        try {
          const {routes, guard, HttpError, aiLive} = await server.ssrLoadModule('/api/_lib/ai.ts');
          if (route === 'health') return send(200, {ok: true, aiLive: aiLive(), provider: 'groq'});
          if (!routes[route]) return send(404, {error: 'Not found'});
          if (req.method !== 'POST') return send(405, {error: 'Method not allowed'});
          let raw = '';
          for await (const chunk of req) raw += chunk;
          try {
            guard(req.headers, req.socket.remoteAddress || 'local');
            send(200, await routes[route](JSON.parse(raw || '{}')));
          } catch (e: any) {
            send(e instanceof HttpError ? e.status : 500, {error: e.message || 'Something went wrong.'});
          }
        } catch (e: any) {
          send(500, {error: e.message || 'Something went wrong.'});
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  // Expose .env values (e.g. GROQ_API_KEY) to the local API only. They are never bundled
  // into the browser code, because nothing in src/ reads them.
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'GROQ_'));

  return {
    plugins: [react(), tailwindcss(), localApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
