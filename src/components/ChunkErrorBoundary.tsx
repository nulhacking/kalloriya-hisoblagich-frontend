import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

/**
 * Error Boundary that catches chunk loading errors and auto-refreshes.
 * This happens when a new deployment removes old JS chunks.
 */
class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk") ||
      error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Unable to preload CSS") ||
      error.message.includes("error loading dynamically imported module");

    return { hasError: true, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ChunkErrorBoundary caught error:", error, errorInfo);

    if (this.state.isChunkError) {
      // Clear cache and reload for chunk errors
      console.log("🔄 Yangi versiya aniqlandi, sahifa yangilanmoqda...");

      // Clear any cached data
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }

      // Small delay then reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div className="min-h-[100dvh] bg-gradient-to-br from-food-green-50 via-food-yellow-50 to-food-orange-50 flex items-center justify-center p-4">
            <div className="text-center bg-white rounded-2xl p-6 shadow-xl max-w-sm">
              <div className="text-5xl mb-4 animate-spin">🔄</div>
              <h2 className="text-lg font-bold text-food-brown-800 mb-2">
                Yangi versiya yuklanmoqda...
              </h2>
              <p className="text-food-brown-600 text-sm mb-4">
                Ilova yangilandi. Sahifa avtomatik yangilanadi.
              </p>
              <button
                onClick={this.handleRefresh}
                className="w-full py-3 bg-food-green-500 text-white rounded-xl font-bold hover:bg-food-green-600 transition-colors"
              >
                Hozir yangilash
              </button>
            </div>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-food-green-50 via-food-yellow-50 to-food-orange-50 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl p-6 shadow-xl max-w-sm">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-lg font-bold text-food-brown-800 mb-2">
              Xatolik yuz berdi
            </h2>
            <p className="text-food-brown-600 text-sm mb-4">
              Kutilmagan xatolik. Iltimos, sahifani yangilang.
            </p>
            <button
              onClick={this.handleRefresh}
              className="w-full py-3 bg-food-green-500 text-white rounded-xl font-bold hover:bg-food-green-600 transition-colors"
            >
              Sahifani yangilash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
