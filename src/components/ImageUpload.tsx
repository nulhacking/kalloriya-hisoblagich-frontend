import { useRef, useState, useEffect } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
  disabled: boolean;
}

const ImageUpload = ({
  onImageSelect,
  imagePreview,
  disabled,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const validateAndSelectFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Iltimos, to'g'ri rasm faylini tanlang (JPEG yoki PNG)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Rasm hajmi 10MB dan kichik bo'lishi kerak");
      return;
    }

    onImageSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Kamera xatosi:", error);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
              });
              validateAndSelectFile(file);
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  };

  // Start camera automatically on mount
  useEffect(() => {
    if (!disabled && !imagePreview) {
      startCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [disabled, imagePreview]);

  return (
    <div className="space-y-3">
      {/* Camera View or Image Preview */}
      {imagePreview ? (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border-4 border-food-green-200 bg-food-green-50">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto max-h-[50vh] md:max-h-[60vh] object-contain mx-auto bg-white"
          />
          {/* Success indicator */}
          <div className="absolute top-3 right-3 bg-food-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <span>✓</span> Tayyor
          </div>
        </div>
      ) : (
        <div className="relative h-[50vh] md:h-[55vh] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-food-green-200 bg-gray-900">
          {/* Skeleton Loader - shown while camera is loading */}
          {!cameraActive && (
            <div className="absolute inset-0 z-20 bg-gradient-to-br from-food-green-100 via-food-yellow-50 to-food-orange-100 flex flex-col items-center justify-center">
              {/* Animated skeleton */}
              <div className="relative">
                {/* Camera icon skeleton */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-food-green-200 to-food-green-300 animate-pulse flex items-center justify-center">
                  <div className="text-4xl md:text-5xl animate-bounce-soft">
                    📷
                  </div>
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border-4 border-food-green-400 animate-ping opacity-30"></div>
              </div>

              {/* Loading text */}
              <div className="mt-6 text-center">
                <p className="text-food-green-700 font-bold text-base md:text-lg">
                  Kamera yuklanmoqda...
                </p>
              </div>

              {/* Skeleton bars */}
              <div className="mt-6 space-y-2 w-48">
                <div className="h-2 bg-food-green-200 rounded-full animate-pulse"></div>
                <div className="h-2 bg-food-green-200 rounded-full animate-pulse w-3/4 mx-auto"></div>
                <div className="h-2 bg-food-green-200 rounded-full animate-pulse w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              cameraActive ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Camera overlay gradient */}
          {cameraActive && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
          )}

          {/* Camera frame corners */}
          {cameraActive && (
            <div className="absolute inset-8 md:inset-12 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-food-green-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-food-green-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-food-green-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-food-green-400 rounded-br-lg"></div>
            </div>
          )}

          {/* Camera status indicator */}
          {cameraActive && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-food-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">LIVE</span>
            </div>
          )}

          {/* Instruction text */}
          {cameraActive && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                🍽️ Ovqatni kadrga oling
              </p>
            </div>
          )}

          {/* Hidden canvas for capturing photo */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Capture Photo Button */}
        <button
          onClick={capturePhoto}
          disabled={disabled || !cameraActive || !!imagePreview}
          className="flex-1 group relative overflow-hidden bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📸</span>
          <span className="text-sm md:text-base">Rasm olish</span>
        </button>

        {/* File Upload Button */}
        <button
          onClick={handleClick}
          disabled={disabled}
          className="flex-1 group relative overflow-hidden bg-gradient-to-r from-food-orange-500 to-food-orange-600 hover:from-food-orange-600 hover:to-food-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📁</span>
          <span className="text-sm md:text-base">Fayldan</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
