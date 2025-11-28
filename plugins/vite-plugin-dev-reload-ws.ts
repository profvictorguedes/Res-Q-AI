/* Dev reload plugin (WebSocket without subprotocol)
 *  - Custom WebSocket HMR implementation without subprotocol requirement
 *  - Proxy-friendly (no "vite-hmr" subprotocol)
 *  - Path redaction (<cwd>)
 *  - Full HMR support with CSS-only fast path
 *  - Mirrors Vite's HMR behavior over plain WebSocket
 */

import type { Plugin, ViteDevServer, HmrContext } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

// Fixed constants
const WS_PATH = '/__dev_hmr';
const PING_INTERVAL_MS = 30000;
const CSS_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.styl', '.pcss'];

export default function devReload(): Plugin {
  let server: ViteDevServer;
  let wss: WebSocketServer;
  const clients = new Set<WebSocket>();
  const cwd = process.cwd();
  let errorHooksInstalled = false;

  function redact(path: string): string {
    return path.replaceAll(cwd, '<cwd>');
  }

  function broadcast(payload: any) {
    const data = JSON.stringify(payload);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (err) {
          console.error('[custom-hmr] Error broadcasting to client:', err);
          clients.delete(client);
        }
      }
    });
  }

  function normalizeBuildError(err: any) {
    return {
      message: (err?.message || String(err)).replaceAll(cwd, '<cwd>'),
      stack: (err?.stack || '').split('\n')
        .map((line: string) => line.replaceAll(cwd, '<cwd>'))
        .join('\n'),
      plugin: err?.plugin,
      id: err?.id ? redact(err.id) : undefined,
    };
  }

  function recordBuildError(err: any) {
    broadcast({ 
      type: 'error',
      err: normalizeBuildError(err)
    });
  }

  const isCSS = (file: string) =>
    CSS_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext));

  return {
    name: 'dev-reload-websocket',
    apply: 'serve',

    // Don't disable HMR - we just add our own WebSocket alongside it
    // The proxy will block Vite's HMR WebSocket but allow ours

    configureServer(_server: ViteDevServer) {
      server = _server;

      if (!errorHooksInstalled) {
        errorHooksInstalled = true;
        try {
          process.on('uncaughtException', recordBuildError);
          process.on('unhandledRejection', recordBuildError);
        } catch {}
      }

      // Create WebSocket server without subprotocol
      wss = new WebSocketServer({ noServer: true });

      wss.on('connection', (ws) => {
        clients.add(ws);
        console.log('[custom-hmr] Client connected, total clients:', clients.size);
        
        // Send connection confirmation
        ws.send(JSON.stringify({ 
          type: 'connected',
          timestamp: Date.now()
        }));

        // Set up ping interval for this client
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            } catch {}
          } else {
            clearInterval(pingInterval);
          }
        }, PING_INTERVAL_MS);

        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'pong') {
              // Client keepalive response
            }
          } catch {}
        });

        ws.on('close', () => {
          clients.delete(ws);
          clearInterval(pingInterval);
          console.log('[custom-hmr] Client disconnected, remaining clients:', clients.size);
        });

        ws.on('error', (err) => {
          console.error('[custom-hmr] WebSocket error:', err);
          clients.delete(ws);
          clearInterval(pingInterval);
        });
      });

      // Handle WebSocket upgrade manually (no subprotocol negotiation)
      server.httpServer?.on('upgrade', (request, socket, head) => {
        const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
        
        if (pathname === WS_PATH) {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      });

      console.log('[custom-hmr] WebSocket server initialized at', WS_PATH);
    },

    handleHotUpdate(ctx: HmrContext) {
      const file = ctx.file;
      const isCSSUpdate = isCSS(file);
      
      // Build the update payload similar to Vite's HMR protocol
      const updates = ctx.modules.map(m => ({
        type: isCSSUpdate ? 'css-update' : 'js-update',
        path: redact(m.url || m.file || ''),
        acceptedPath: redact(m.url || m.file || ''),
        timestamp: ctx.timestamp,
      }));

      broadcast({
        type: 'update',
        updates,
      });

      console.log('[custom-hmr] Update broadcast:', {
        file: redact(file),
        isCSSUpdate,
        moduleCount: ctx.modules.length,
        clientCount: clients.size
      });

      // Return modules to let Vite's internal HMR continue (for invalidation, etc.)
      return ctx.modules;
    },

    transformIndexHtml() {
      const script = `
(() => {
  console.log('[custom-hmr] Initializing custom HMR client');
  
  let ws;
  let reconnectTimer;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RECONNECT_DELAY = 1000;

  function applyCSS(path, timestamp) {
    // Find and reload CSS files matching this path
    const pathWithoutQuery = path.split('?')[0];
    const links = document.querySelectorAll(\`link[rel="stylesheet"]\`);
    
    let applied = false;
    links.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      if (linkPath.includes(pathWithoutQuery) || pathWithoutQuery.includes(linkPath)) {
        const url = new URL(link.href, location.origin);
        url.searchParams.set('t', String(timestamp));
        
        const newLink = link.cloneNode();
        newLink.href = url.toString();
        newLink.addEventListener('load', () => {
          link.remove();
          console.log('[custom-hmr] CSS reloaded:', pathWithoutQuery);
        });
        link.after(newLink);
        applied = true;
      }
    });
    
    return applied;
  }

  function handleUpdate(payload) {
    const { updates } = payload;
    console.log('[custom-hmr] Received update:', updates);
    
    let hasNonCSS = false;
    let cssUpdated = false;

    for (const update of updates) {
      if (update.type === 'css-update') {
        const applied = applyCSS(update.path, update.timestamp);
        if (applied) cssUpdated = true;
      } else {
        hasNonCSS = true;
      }
    }

    // If there are any non-CSS updates, do a full reload
    if (hasNonCSS) {
      console.log('[custom-hmr] Non-CSS update detected, reloading page');
      location.reload();
    } else if (cssUpdated) {
      console.log('[custom-hmr] CSS-only update applied');
    }
  }

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = \`\${protocol}//\${location.host}${WS_PATH}\`;
    
    console.log('[custom-hmr] Connecting to:', url);
    
    // Create WebSocket WITHOUT subprotocol - this is the key difference
    ws = new WebSocket(url);

    ws.addEventListener('open', () => {
      console.log('[custom-hmr] Connected successfully');
      reconnectAttempts = 0;
      clearTimeout(reconnectTimer);
    });

    ws.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        switch (payload.type) {
          case 'connected':
            console.log('[custom-hmr] Server acknowledged connection');
            break;
            
          case 'update':
            handleUpdate(payload);
            break;
            
          case 'full-reload':
            console.log('[custom-hmr] Full reload requested');
            location.reload();
            break;
            
          case 'error':
            console.error('[custom-hmr] Build error:', payload.err);
            break;
            
          case 'ping':
            // Respond to server ping
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
            break;
        }
      } catch (err) {
        console.error('[custom-hmr] Error handling message:', err);
      }
    });

    ws.addEventListener('close', () => {
      console.log('[custom-hmr] Disconnected');
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts), 30000);
        console.log(\`[custom-hmr] Reconnecting in \${delay}ms (attempt \${reconnectAttempts + 1}/\${MAX_RECONNECT_ATTEMPTS})\`);
        reconnectAttempts++;
        reconnectTimer = setTimeout(connect, delay);
      } else {
        console.error('[custom-hmr] Max reconnection attempts reached. Please refresh the page.');
      }
    });

    ws.addEventListener('error', (err) => {
      console.error('[custom-hmr] WebSocket error:', err);
    });
  }

  // Start connection
  connect();
  
  // Expose API for debugging
  window.__customHmr = {
    reconnect: () => {
      reconnectAttempts = 0;
      if (ws) ws.close();
      connect();
    },
    status: () => ({
      readyState: ws?.readyState,
      reconnectAttempts,
      states: {
        0: 'CONNECTING',
        1: 'OPEN',
        2: 'CLOSING',
        3: 'CLOSED'
      }[ws?.readyState] || 'UNKNOWN'
    }),
    forceReload: () => location.reload()
  };
  
  console.log('[custom-hmr] Client initialized. Use window.__customHmr for debugging.');
})();
`;

      return {
        html: '',
        tags: [
          {
            tag: 'script',
            injectTo: 'head',
            attrs: { type: 'module' },
            children: script,
          },
        ],
      };
    },
  };
}
