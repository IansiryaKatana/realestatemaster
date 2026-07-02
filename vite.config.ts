import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const cssTreeBundled = path.resolve(rootDir, 'node_modules/css-tree/dist/csstree.esm.js')

/**
 * DEPLOY_TARGET controls the production adapter:
 * - `node`    → Hostinger / VPS / any Node host (Nitro node-server → .output/)
 * - `netlify` → Netlify (official plugin → dist/client + serverless)
 * - `vercel`  → Vercel (Nitro vercel preset → serverless functions)
 */
const deployTarget = process.env.DEPLOY_TARGET ?? 'node'
const isNetlify = deployTarget === 'netlify'
const isVercel = deployTarget === 'vercel'

/**
 * Nitro's dev worker can race on Windows before the "nitro" Vite environment is ready
 * (NitroViteError: Vite environment "nitro" is unavailable). TanStack Start handles
 * SSR in dev without the Nitro plugin; Nitro is only required for production builds.
 */
export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      // jsdom → css-tree uses dynamic JSON requires that break in Vercel serverless bundles.
      ...(isVercel ? { 'css-tree': cssTreeBundled } : {}),
    },
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    ...(isNetlify
      ? [netlify()]
      : isVercel
        ? command === 'build'
          ? [
              nitro({
                preset: 'vercel',
                alias: {
                  'css-tree': 'css-tree/dist/csstree.esm.js',
                },
              }),
            ]
          : []
        : command === 'build'
          ? [nitro({ preset: 'node-server' })]
          : []),
  ],
}))
