import { getTailwindSafelist } from '@maker-studio/power-platform-gen-inline-editor-engine';
import type { Plugin } from 'vite';

/**
 * Vite plugin to inject @source inline directives into the main Tailwind CSS file
 * so Tailwind CSS will always include these classes in the build. This is required for the inline editor
 * where it can manually set these classes without modifying the source code so users can see them in the app preview.
 */
export function tailwindSafelistPlugin(): Plugin {
  return {
    name: 'tailwind-safelist',
    /**
     * Development only since we only need this for the inline editor functionality during the app making experience.
     * We should not include this when we publish the app.
     */
    apply: 'serve',
    /**
     * Run before Tailwind plugin.
     */
    enforce: 'pre',
    transform(code, id) {
      // Check all CSS files to find the one that imports Tailwind
      if (id.endsWith('.css') && code.includes("@import 'tailwindcss'")) {
        const safelist = getTailwindSafelist();

        // Generate @source inline directives
        const sourceDirectives = safelist.map((cls) => `@source inline("${cls}");`).join('\n');

        // Append at the end of the file
        return `${code}\n\n/* Auto-generated safelist */\n${sourceDirectives}`;
      }
    },
  };
}
