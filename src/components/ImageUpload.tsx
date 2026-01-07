import { useRef, useState, useEffect, useCallback } from "react";

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
  const [isMobile, setIsMobile] = useState(false);
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

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
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
  }, []);

  // Start camera on mobile devices
  useEffect(() => {
    if (isMobile && !disabled && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isMobile, disabled, imagePreview, startCamera, stopCamera]);

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

  return (
    <div className="space-y-4">
      {/* Camera View - Mobile */}
      {isMobile && cameraActive && !imagePreview && !disabled && (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto max-h-[60vh] object-cover"
            style={{ transform: "scaleX(-1)" }} // Mirror effect
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

          {/* Capture Button */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={capturePhoto}
              disabled={disabled}
              className="bg-white hover:bg-gray-100 active:scale-95 rounded-full p-5 shadow-2xl transition-all duration-200 border-4 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-400"></div>
            </button>
          </div>

          {/* File upload button overlay */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={handleClick}
              disabled={disabled}
              className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-3 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area - Desktop or when camera is not active */}
      {(!isMobile || !cameraActive || imagePreview) && (
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
            accept="image/jpeg,image/jpg,image/png,image/*"
            capture="environment"
            onChange={handleFileChange}
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
      )}
    </div>
  );
};

export default ImageUpload;
