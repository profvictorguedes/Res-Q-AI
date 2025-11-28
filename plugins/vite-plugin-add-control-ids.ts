import type { Plugin } from 'vite';
import { addControlIds } from '@maker-studio/power-platform-gen-inline-editor-engine';
import path from 'path';

/**
 * Vite plugin to add control IDs to controls for the inline editor.
 */
export function addControlIdsPlugin(): Plugin {
  return {
    name: 'add-control-ids',
    /**
     * Development only since we only need this for the inline editing functionality during the app making experience.
     * We should not include this when we publish the app.
     */
    apply: 'serve',
    enforce: 'pre', // Run before other plugins (especially React)
    transform(code, id) {
      // Only process TSX files under src/pages
      const isInPages = id.includes('/src/pages/');
      const isTsxFile = id.endsWith('.tsx');

      if (!isInPages || !isTsxFile) {
        return null;
      }

      try {
        // Extract relative path from project root (e.g., "/src/pages/index.tsx")
        const relativePath = '/' + path.relative(process.cwd(), id).replace(/\\/g, '/');

        // Apply addControlIds transformation
        const result = addControlIds(code, relativePath);
        const transformedCode = result.modifiedContent;
        const modificationCount = result.modificationCount;

        console.log(`Transformed: ${relativePath} with ${modificationCount} modifications`);

        return transformedCode;
      } catch (error) {
        console.error(`Error transforming ${id}:`, error);
        // Return null to let Vite handle the original code
        return null;
      }
    },
  };
}
