/**
 * Image compression utilities for optimizing food analysis.
 *
 * Reduces image size before sending to AI API:
 * - Smaller file = faster upload, fewer tokens
 * - OpenAI Vision "low" detail uses 512x512 - we match that
 * - Aggressive compression = max 512px, quality 0.75
 */

/**
 * Compression result with stats for UI display
 */
export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reduction: number;
  format: "jpeg" | "webp";
  dimensions: { width: number; height: number };
}

/**
 * Check if browser supports WebP encoding
 */
const supportsWebP = (): boolean => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
};

/**
 * Resize and compress an image file.
 * - Resizes longest side to maxLongSide (default 768px)
 * - Converts to WebP if supported, otherwise JPEG
 * - Strips EXIF data automatically via canvas redraw
 *
 * @param file - Original image file
 * @param maxLongSide - Maximum dimension for longest side (default: 768)
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Compression result with file and stats
 */
export const imageResizeCompress = async (
  file: File,
  maxLongSide: number = 768,
  quality: number = 0.8,
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not supported"));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions based on longest side
      let width = img.width;
      let height = img.height;
      const longestSide = Math.max(width, height);

      if (longestSide > maxLongSide) {
        const scale = maxLongSide / longestSide;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw resized image (this also strips EXIF)
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format (WebP preferred if supported)
      const useWebP = supportsWebP();
      const mimeType = useWebP ? "image/webp" : "image/jpeg";
      const extension = useWebP ? ".webp" : ".jpg";
      const format = useWebP ? "webp" : "jpeg";

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          // Create new file with compressed data
          const newFileName = file.name.replace(/\.[^.]+$/, extension);
          const compressedFile = new File([blob], newFileName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          // Calculate stats
          const originalSize = file.size;
          const compressedSize = compressedFile.size;
          const reduction = Math.round(
            (1 - compressedSize / originalSize) * 100,
          );

          // Log compression stats
          const originalKB = Math.round(originalSize / 1024);
          const compressedKB = Math.round(compressedSize / 1024);

          console.log(
            `📸 Rasm optimizatsiya: ${originalKB}KB → ${compressedKB}KB (${reduction}% kamaydi) [${format.toUpperCase()}, ${width}x${height}]`,
          );

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            reduction,
            format: format as "jpeg" | "webp",
            dimensions: { width, height },
          });
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image for AI analysis - token-friendly settings.
 * 512px max (matches OpenAI low-detail), quality 0.75.
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 512,
  quality: number = 0.75,
): Promise<File> => {
  const result = await imageResizeCompress(file, maxWidth, quality);
  return result.file;
};

/**
 * Check if file needs compression.
 * Compress if >50KB - ensures token savings for most uploads.
 */
export const needsCompression = (
  file: File,
  maxSizeKB: number = 50,
): boolean => {
  return file.size > maxSizeKB * 1024;
};

/**
 * Get human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
