import { lazy, ComponentType } from "react";

/**
 * Lazy import with retry logic.
 * If chunk loading fails (after new deployment), retries with cache bust.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Chunk loading attempt ${attempt + 1} failed:`, error);

        // On retry, try to bust cache
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Clear module cache hint (modern browsers)
          if ("caches" in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map((key) => caches.delete(key)));
            } catch {
              // Ignore cache clear errors
            }
          }
        }
      }
    }

    // All retries failed - throw to trigger error boundary
    throw lastError;
  });
}
