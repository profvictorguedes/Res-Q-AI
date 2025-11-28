import type { Plugin } from 'vite';
import { getPreviewScript } from '@maker-studio/power-platform-app-gen-preview-messenger-script';

/**
 * Vite plugin to inject the messenger preview script.
 */
export function messengerPreviewScriptPlugin(): Plugin {
  return {
    name: 'messenger-preview-script',
    /**
     * Development only since we only need this for the messenger functionality during the app making experience.
     * We should not include this when we publish the app.
     */
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'body',
              attrs: { src: '/messenger-preview-script.js' },
            },
          ],
        };
      },
    },
    configureServer(server) {
      // Serve the actual script file via middleware
      server.middlewares.use('/messenger-preview-script.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(getPreviewScript());
      });
    },
  };
}
