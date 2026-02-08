/**
 * Food analysis upload utility.
 *
 * Uploads compressed image to backend for AI analysis.
 * Uses multipart/form-data for efficient transfer.
 */

import type { AnalysisResults } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Options for food analysis upload
 */
export interface AnalyzeOptions {
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Optional custom prompt for analysis */
  prompt?: string;
}

/**
 * API error with status code
 */
export class AnalyzeError extends Error {
  status?: number;
  requestId?: string;

  constructor(message: string, status?: number, requestId?: string) {
    super(message);
    this.name = "AnalyzeError";
    this.status = status;
    this.requestId = requestId;
  }
}

/**
 * Upload image for food analysis.
 *
 * @param file - Compressed image file (from imageResizeCompress)
 * @param options - Optional timeout and prompt
 * @returns Analysis results from OpenAI Vision
 * @throws AnalyzeError on failure
 */
export async function uploadAnalyze(
  file: File,
  options: AnalyzeOptions = {},
): Promise<AnalysisResults> {
  const { timeout = 30000, prompt } = options;

  // Create form data (multipart, NOT base64)
  const formData = new FormData();
  formData.append("image", file);
  if (prompt) {
    formData.append("prompt", prompt);
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = performance.now();

    const response = await fetch(`${API_BASE_URL}/analyze-food`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    const latency = Math.round(performance.now() - startTime);
    const requestId = response.headers.get("X-Request-ID");

    console.log(
      `🍽️ Tahlil yakunlandi: ${latency}ms${requestId ? ` [${requestId}]` : ""}`,
    );

    if (!response.ok) {
      let errorMessage = "Server xatosi yuz berdi";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
      throw new AnalyzeError(
        errorMessage,
        response.status,
        requestId || undefined,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AnalyzeError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new AnalyzeError(`So'rov vaqti tugadi (${timeout / 1000}s)`, 408);
      }
      throw new AnalyzeError(
        "Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring",
      );
    }

    throw new AnalyzeError("Kutilmagan xatolik yuz berdi");
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Analyze a food image with automatic compression.
 *
 * Convenience function that compresses then uploads.
 *
 * @param file - Raw image file from input
 * @param options - Analysis options
 * @returns Analysis results
 */
export async function analyzeWithCompression(
  file: File,
  options: AnalyzeOptions = {},
): Promise<{
  results: AnalysisResults;
  compressionStats: {
    originalSize: number;
    compressedSize: number;
    reduction: number;
  };
}> {
  // Import dynamically to avoid circular deps
  const { imageResizeCompress, needsCompression } =
    await import("./imageUtils");

  let processedFile = file;
  let compressionStats = {
    originalSize: file.size,
    compressedSize: file.size,
    reduction: 0,
  };

  // Compress if needed
  if (needsCompression(file)) {
    const result = await imageResizeCompress(file);
    processedFile = result.file;
    compressionStats = {
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      reduction: result.reduction,
    };
  }

  const results = await uploadAnalyze(processedFile, options);
  return { results, compressionStats };
}
