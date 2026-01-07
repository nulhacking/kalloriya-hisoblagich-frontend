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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

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

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
      setIsCapturing(false);
      // Reset input
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
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
        setShowCamera(true);
        setIsCapturing(true);
      }
    } catch (error) {
      console.error("Kamera xatosi:", error);
      // Fallback to file input with capture
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        alert(
          "Kameraga kirish imkoni yo'q. Iltimos, fayl yuklashdan foydalaning."
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
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
              stopCamera();
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  };

  const handleCameraClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    // Check if getUserMedia is available
    if (
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    ) {
      await startCamera();
    } else {
      // Fallback to file input with capture attribute
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        alert(
          "Kameraga kirish imkoni yo'q. Iltimos, fayl yuklashdan foydalaning."
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      validateAndSelectFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer
          transition-all duration-300 overflow-hidden
          ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : imagePreview
              ? "border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg"
              : "border-primary-300 bg-gradient-to-br from-white via-primary-50 to-primary-100 hover:border-primary-500 hover:shadow-xl hover:scale-[1.02]"
          }
        `}
      >
        {/* Animated background gradient */}
        {!imagePreview && !disabled && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Hidden canvas for capturing photo */}
        <canvas ref={canvasRef} className="hidden" />

        {imagePreview ? (
          <div className="relative space-y-4 z-10">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-80 mx-auto rounded-2xl shadow-2xl object-contain border-4 border-white"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Rasmni o'zgartirish uchun bosing
            </p>
          </div>
        ) : (
          <div className="space-y-6 z-10 relative">
            <div className="flex justify-center">
              <div className="relative">
                <div className="text-7xl animate-bounce">📸</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                Rasm yuklang yoki sudrab tashlang
              </p>
              <p className="text-sm md:text-base text-gray-600">
                JPEG yoki PNG (maksimal 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Camera View */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
              style={{ transform: "scaleX(-1)" }} // Mirror effect
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={stopCamera}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all duration-200"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                className="bg-white hover:bg-gray-100 rounded-full p-6 shadow-2xl transition-all duration-200 border-4 border-gray-300"
              >
                <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-400"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!imagePreview && !disabled && !showCamera && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClick}
            className="flex-1 group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <span className="relative z-10 flex items-center gap-2">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Fayldan yuklash
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button
            onClick={handleCameraClick}
            disabled={isCapturing}
            className="flex-1 group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            <span className="relative z-10 flex items-center gap-2">
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
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {isCapturing ? "Kamera ochilmoqda..." : "Kameradan olish"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
