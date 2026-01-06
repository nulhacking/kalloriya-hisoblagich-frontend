import { useState } from "react";
import { analyzeFood } from "./services/api";
import ImageUpload from "./components/ImageUpload";
import ResultsDisplay from "./components/ResultsDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import type { AnalysisResults } from "./types";

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    if (file) {
      setImage(file);
      setResults(null);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError("Iltimos, avval rasm tanlang");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeFood(image);
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Rasmni tahlil qilishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-2">
            🍽️ Kalloriya Hisoblagich
          </h1>
          <p className="text-lg text-gray-600">
            Sun'iy intellekt asosida ovqat kaloriyalarini tahlil qilish
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Image Upload Section */}
          <ImageUpload
            onImageSelect={handleImageSelect}
            imagePreview={imagePreview}
            disabled={loading}
          />

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAnalyze}
              disabled={!image || loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Tahlil qilinmoqda...
                </>
              ) : (
                "Ovqatni tahlil qilish"
              )}
            </button>
            {(image || results) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg transition-colors duration-200"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && <ResultsDisplay results={results} />}
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Ovqat rasmini yuklab, 100g uchun darhol kaloriya ma'lumotlarini
            oling
          </p>
          <p className="mt-1">
            Natijalar taxminiy va tayyorlash usuliga qarab farq qilishi mumkin
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
