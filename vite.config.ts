import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "VITE_");
  const apiUrl = env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  const apiHostPattern = apiUrl
    ? new RegExp(`^${escapeRegExp(apiUrl)}/.*`, "i")
    : null;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["logo.png", "favicon.ico"],
        manifest: {
          name: "Kaloriya Hisoblagich",
          short_name: "Kaloriya Hisoblagich",
          description:
            "Ovqatlarni suratga olib kaloriyalarni hisoblang - AI yordamida",
          theme_color: "#22c55e",
          background_color: "#fefce8",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            ...(apiHostPattern
              ? [
                  {
                    urlPattern: apiHostPattern,
                    handler: "NetworkFirst" as const,
                    options: {
                      cacheName: "api-cache",
                      expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24, // 24 soat
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ]
              : []),
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 kun
                },
              },
            },
            {
              urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "font-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 yil
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    server: {
      port: 3000,
      ...(apiUrl
        ? {
            proxy: {
              "/api": {
                target: apiUrl,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
              },
            },
          }
        : {}),
    },
    build: {
      // Performance optimizations
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            query: ["@tanstack/react-query"],
          },
        },
      },
      // Chunk size warning limit
      chunkSizeWarningLimit: 500,
    },
  };
});
