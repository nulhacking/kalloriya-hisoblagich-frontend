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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl relative z-10">
        {/* Header */}
        <header className="text-center mb-10 md:mb-12">
          <div className="inline-block mb-4">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-primary-600 bg-clip-text text-transparent mb-3 animate-fade-in">
                🍽️ Kaloriya Hisoblagich
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto">
            Sun'iy intellekt asosida ovqat kaloriyalarini tahlil qilish
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              ⚡ Tezkor
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              🎯 Aniq
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              🤖 AI
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20">
          {/* Image Upload Section */}
          <ImageUpload
            onImageSelect={handleImageSelect}
            imagePreview={imagePreview}
            disabled={loading}
          />

          {/* Action Buttons */}
          {imagePreview && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleAnalyze}
                disabled={!image || loading}
                className="group flex-1 relative overflow-hidden bg-gradient-to-r from-primary-600 via-blue-600 to-primary-600 hover:from-primary-700 hover:via-blue-700 hover:to-primary-700 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="text-lg">Tahlil qilinmoqda...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span className="text-lg">Ovqatni tahlil qilish</span>
                    </>
                  )}
                </span>
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-blue-700 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
              {(image || results) && (
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:from-gray-50 disabled:to-gray-100 disabled:cursor-not-allowed text-gray-700 font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Tozalash
                </button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-lg animate-shake">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="mt-8 animate-fade-in-up">
              <ResultsDisplay results={results} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-10 md:mt-12 text-gray-600 text-sm md:text-base">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <p className="font-medium mb-2">
              📸 Ovqat rasmini yuklab, 100g uchun darhol kaloriya ma'lumotlarini
              oling
            </p>
            <p className="text-gray-500">
              ⚠️ Natijalar taxminiy va tayyorlash usuliga qarab farq qilishi
              mumkin
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
