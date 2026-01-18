import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setNeedRefresh(false);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-food-green-200 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🔄</div>
          <div className="flex-1">
            <h3 className="font-bold text-food-brown-800 mb-1">
              Yangi versiya mavjud!
            </h3>
            <p className="text-sm text-food-brown-600 mb-3">
              Ilovaning yangi versiyasi tayyor. Yangilash uchun tugmani bosing.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-gradient-to-r from-food-green-500 to-food-green-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-food-green-600 hover:to-food-green-700 transition-all duration-200 shadow-md"
              >
                Yangilash
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-food-brown-600 hover:bg-food-brown-100 rounded-xl transition-colors"
              >
                Keyinroq
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
