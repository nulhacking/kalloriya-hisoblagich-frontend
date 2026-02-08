import { useState, useCallback } from "react";
import {
  imageResizeCompress,
  formatFileSize,
  type CompressionResult,
} from "../utils/imageUtils";
import { uploadAnalyze, AnalyzeError } from "../utils/analyzeFoodUpload";
import type { AnalysisResults } from "../types";

/**
 * Demo component showing image compression and food analysis.
 * Shows original vs optimized size and analysis results.
 */
export function FoodAnalyzerDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [compressionStats, setCompressionStats] =
    useState<CompressionResult | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      setResults(null);
      setCompressionStats(null);

      try {
        // Step 1: Compress image
        const compressed = await imageResizeCompress(file);
        setCompressionStats(compressed);

        // Step 2: Upload and analyze
        const analysisResults = await uploadAnalyze(compressed.file);
        setResults(analysisResults);
      } catch (err) {
        if (err instanceof AnalyzeError) {
          setError(`${err.message} (${err.status || "unknown"})`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Kutilmagan xatolik");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <div className="food-analyzer-demo">
      <h2>🍽️ Ovqat tahlili</h2>

      {/* File input */}
      <div className="upload-section">
        <label htmlFor="food-image" className="upload-label">
          📷 Rasm tanlang
        </label>
        <input
          type="file"
          id="food-image"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="loading">
          <span className="spinner">⏳</span> Tahlil qilinmoqda...
        </div>
      )}

      {/* Compression stats */}
      {compressionStats && (
        <div className="compression-stats">
          <h3>📊 Optimizatsiya</h3>
          <table>
            <tbody>
              <tr>
                <td>Asl hajm:</td>
                <td>{formatFileSize(compressionStats.originalSize)}</td>
              </tr>
              <tr>
                <td>Yangi hajm:</td>
                <td>{formatFileSize(compressionStats.compressedSize)}</td>
              </tr>
              <tr>
                <td>Kamayish:</td>
                <td className="reduction">{compressionStats.reduction}%</td>
              </tr>
              <tr>
                <td>Format:</td>
                <td>{compressionStats.format.toUpperCase()}</td>
              </tr>
              <tr>
                <td>O'lcham:</td>
                <td>
                  {compressionStats.dimensions.width}x
                  {compressionStats.dimensions.height}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="error">
          <span>❌</span> {error}
        </div>
      )}

      {/* Results display */}
      {results && (
        <div className="results">
          <h3>🍴 Natija</h3>
          <div className="food-info">
            <p>
              <strong>Ovqat:</strong> {results.food}
            </p>
            <p>
              <strong>Ishonch:</strong> {Math.round(results.confidence * 100)}%
            </p>
            {results.estimated_weight_grams && (
              <p>
                <strong>Vazn:</strong> ~{results.estimated_weight_grams}g
              </p>
            )}
          </div>

          {results.ingredients && results.ingredients.length > 0 && (
            <div className="ingredients">
              <strong>Ingredientlar:</strong>
              <ul>
                {results.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {results.nutrition_per_100g && (
            <div className="nutrition">
              <strong>100g uchun:</strong>
              <ul>
                <li>Kaloriya: {results.nutrition_per_100g.calories} kkal</li>
                <li>Oqsil: {results.nutrition_per_100g.oqsil}g</li>
                <li>Uglevodlar: {results.nutrition_per_100g.carbs}g</li>
                <li>Yog': {results.nutrition_per_100g.fat}g</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <style>{`
        .food-analyzer-demo {
          max-width: 480px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .upload-section {
          margin: 20px 0;
        }
        .upload-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        input[type="file"] {
          width: 100%;
          padding: 12px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
        }
        input[type="file"]:hover {
          border-color: #666;
        }
        .loading {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        .spinner {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .compression-stats {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .compression-stats h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
        }
        .compression-stats table {
          width: 100%;
          font-size: 13px;
        }
        .compression-stats td {
          padding: 4px 0;
        }
        .compression-stats td:first-child {
          color: #666;
        }
        .reduction {
          color: #16a34a;
          font-weight: 600;
        }
        .error {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .results {
          background: #f0fdf4;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .results h3 {
          margin: 0 0 12px 0;
        }
        .food-info p {
          margin: 4px 0;
        }
        .ingredients ul,
        .nutrition ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        .ingredients li,
        .nutrition li {
          margin: 2px 0;
        }
      `}</style>
    </div>
  );
}
