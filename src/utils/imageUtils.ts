/**
 * Image compression utilities for optimizing food analysis.
 *
 * Reduces image size before sending to AI API:
 * - Smaller file = faster upload
 * - Smaller dimensions = fewer tokens
 * - OpenAI Vision works well with 512-2048px images
 */

/**
 * Compress and resize an image file.
 *
 * @param file - Original image file
 * @param maxWidth - Maximum width in pixels (default: 1024)
 * @param quality - JPEG quality 0-1 (default: 0.75)
 * @returns Compressed image file
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1024,
  quality: number = 0.75,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not supported"));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          // Create new file with compressed data
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            },
          );

          // Log compression stats
          const originalKB = Math.round(file.size / 1024);
          const compressedKB = Math.round(compressedFile.size / 1024);
          const reduction = Math.round(
            (1 - compressedFile.size / file.size) * 100,
          );

          console.log(
            `📸 Rasm optimizatsiya: ${originalKB}KB → ${compressedKB}KB (${reduction}% kamaydi)`,
          );

          resolve(compressedFile);
        },
        "image/jpeg",
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
 * Check if file needs compression.
 * Skip compression for already small files.
 */
export const needsCompression = (
  file: File,
  maxSizeKB: number = 300,
): boolean => {
  return file.size > maxSizeKB * 1024;
};
