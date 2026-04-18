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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  // 'granted' => avtomatik yoqiladi; 'prompt'/'denied'/'unknown' => tugma ko'rsatiladi
  const [permissionState, setPermissionState] = useState<
    "granted" | "prompt" | "denied" | "unknown" | "checking"
  >("checking");

  const validateAndSelectFile = (file: File) => {
    const byName = /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name);
    const byMime = file.type.startsWith("image/");
    if (!byMime && !byName) {
      alert(
        "Iltimos, rasm faylini tanlang (JPEG, PNG, WebP yoki boshqa keng tarqalgan rasm formati).",
      );
      return;
    }

    // No size limit - compression will handle large files automatically
    // Log original size for debugging
    const sizeKB = Math.round(file.size / 1024);
    if (sizeKB > 1000) {
      console.log(`📁 Katta fayl: ${sizeKB}KB - avtomatik siqiladi`);
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
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Kamera qo'llab-quvvatlanmaydi. Iltimos, fayl yuklashdan foydalaning.",
        );
        setCameraActive(false);
        setCameraPermissionDenied(false);
        return;
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setCameraError(null);
      setCameraPermissionDenied(false);

      // Try to get camera with preferred settings first
      let stream: MediaStream;

      // Attempt 1: Strict rear camera with resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" }, // Force rear camera
            width: { ideal: 1024 },
            height: { ideal: 768 },
          },
          audio: false,
        });
      } catch (exactError) {
        console.warn("Exact rear camera failed, trying ideal:", exactError);

        // Attempt 2: Preferred rear camera (may fall back on some devices)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1024 },
              height: { ideal: 768 },
            },
            audio: false,
          });
        } catch (idealError) {
          console.warn(
            "Ideal rear camera failed, trying basic environment:",
            idealError,
          );

          // Attempt 3: Basic rear camera request
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
            },
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError(null);
        setCameraPermissionDenied(false);
        setPermissionState("granted");
      }
    } catch (error: any) {
      console.error("Kamera xatosi:", error);
      setCameraActive(false);

      // Handle specific error types
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setCameraError(
          "Kamera ruxsati berilmagan. Iltimos, brauzer sozlamalaridan kamera ruxsatini bering.",
        );
        setCameraPermissionDenied(true);
        setPermissionState("denied");
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setCameraError(
          "Kamera topilmadi. Iltimos, fayl yuklashdan foydalaning.",
        );
        setCameraPermissionDenied(false);
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        setCameraError(
          "Kamera allaqachon ishlatilmoqda yoki xatolik yuz berdi. Iltimos, fayl yuklashdan foydalaning.",
        );
        setCameraPermissionDenied(false);
      } else if (error.name === "OverconstrainedError") {
        setCameraError(
          "Kamera sozlamalari qo'llab-quvvatlanmaydi. Iltimos, fayl yuklashdan foydalaning.",
        );
        setCameraPermissionDenied(false);
      } else {
        setCameraError(
          "Kamera ishga tushirishda xatolik yuz berdi. Iltimos, fayl yuklashdan foydalaning.",
        );
        setCameraPermissionDenied(false);
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Limit canvas size for token savings (OpenAI low-detail = 512px)
        const maxDim = 512;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
              });
              console.log(`📷 Kamera: ${Math.round(blob.size / 1024)}KB`);
              validateAndSelectFile(file);
            }
          },
          "image/jpeg",
          0.6, // Token-friendly: smaller file, quicker upload
        );
      }
    }
  };

  // Kamera ruxsatini tekshirish — faqat 'granted' bo'lsa avtomatik yoqiladi.
  // Aks holda foydalanuvchi "Kamerani yoqish" tugmasini bosishi kerak.
  useEffect(() => {
    let cancelled = false;

    const checkPermissionAndMaybeStart = async () => {
      if (disabled || imagePreview) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setPermissionState("unknown");
        return;
      }

      // Permissions API hamma brauzerda mavjud emas (masalan iOS Safari).
      // U yerda ruxsat statusini aniqlab bo'lmaydi — tugma ko'rsatamiz.
      const permsApi = (navigator as any).permissions;
      if (!permsApi?.query) {
        if (!cancelled) setPermissionState("prompt");
        return;
      }

      try {
        const status: PermissionStatus = await permsApi.query({
          name: "camera" as PermissionName,
        });
        if (cancelled) return;

        const apply = (state: PermissionState) => {
          if (cancelled) return;
          if (state === "granted") {
            setPermissionState("granted");
            startCamera();
          } else if (state === "denied") {
            setPermissionState("denied");
          } else {
            setPermissionState("prompt");
          }
        };

        apply(status.state);
        status.onchange = () => apply(status.state);
      } catch {
        // query("camera") ba'zi brauzerlarda throw qiladi — tugma ko'rsatamiz
        if (!cancelled) setPermissionState("prompt");
      }
    };

    checkPermissionAndMaybeStart();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {/* Error Message - shown when camera fails */}
          {cameraError && (
            <div className="absolute inset-0 z-30 bg-gradient-to-br from-food-red-50 via-food-orange-50 to-food-yellow-50 flex flex-col items-center justify-center p-6">
              <div className="text-center max-w-md">
                {/* Error icon */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-food-red-200 to-food-red-300 flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl md:text-5xl">⚠️</div>
                </div>

                {/* Error message */}
                <p className="text-food-red-700 font-bold text-base md:text-lg mb-3">
                  {cameraError}
                </p>

                {/* Retry button for permission errors */}
                {cameraPermissionDenied && (
                  <button
                    onClick={startCamera}
                    className="mt-4 bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 text-white font-bold py-2 px-6 rounded-xl transition-all duration-300 shadow-lg active:scale-95"
                  >
                    Qayta urinib ko'rish
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ruxsat hali berilmagan yoki rad etilgan — "Kamerani yoqish" tugmasi */}
          {!cameraActive &&
            !cameraError &&
            (permissionState === "prompt" ||
              permissionState === "denied" ||
              permissionState === "unknown") && (
              <div className="absolute inset-0 z-20 bg-gradient-to-br from-food-green-100 via-food-yellow-50 to-food-orange-100 flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-food-green-200 to-food-green-300 flex items-center justify-center mb-4 shadow-md">
                  <div className="text-4xl md:text-5xl">📷</div>
                </div>
                <p className="text-food-green-800 font-bold text-base md:text-lg mb-1 text-center">
                  Kamera yoqilmagan
                </p>
                <p className="text-food-brown-600 text-xs md:text-sm mb-5 text-center max-w-xs">
                  {permissionState === "denied"
                    ? "Ruxsat rad etilgan. Brauzer sozlamalaridan ruxsat bering yoki rasm yuklang."
                    : "Ovqatni darhol suratga olish uchun kamerani yoqing."}
                </p>
                <button
                  onClick={startCamera}
                  disabled={disabled}
                  className="bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <span className="text-xl">📸</span>
                  <span className="text-sm md:text-base">Kamerani yoqish</span>
                </button>
              </div>
            )}

          {/* Skeleton — faqat ruxsat berilgan, kamera hali yuklanmoqda holatida */}
          {!cameraActive &&
            !cameraError &&
            (permissionState === "granted" ||
              permissionState === "checking") && (
              <div className="absolute inset-0 z-20 bg-gradient-to-br from-food-green-100 via-food-yellow-50 to-food-orange-100 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-food-green-200 to-food-green-300 animate-pulse flex items-center justify-center">
                    <div className="text-4xl md:text-5xl animate-bounce-soft">
                      📷
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-food-green-400 animate-ping opacity-30"></div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-food-green-700 font-bold text-base md:text-lg">
                    Kamera yuklanmoqda...
                  </p>
                </div>
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
      <div
        className={`flex gap-2 ${
          cameraError && !cameraActive ? "flex-col" : ""
        }`}
      >
        {/* Capture Photo Button - only show if camera is available */}
        {!cameraError && (
          <button
            onClick={capturePhoto}
            disabled={disabled || !cameraActive || !!imagePreview}
            className="flex-1 group relative overflow-hidden bg-gradient-to-r from-food-green-500 to-food-green-600 hover:from-food-green-600 hover:to-food-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            <span className="text-xl">📸</span>
            <span className="text-sm md:text-base">Rasm olish</span>
          </button>
        )}

        {/* File Upload Button - always available */}
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`${
            cameraError && !cameraActive ? "w-full" : "flex-1"
          } group relative overflow-hidden bg-gradient-to-r from-food-orange-500 to-food-orange-600 hover:from-food-orange-600 hover:to-food-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2`}
        >
          <span className="text-xl">📁</span>
          <span className="text-sm md:text-base">
            {cameraError && !cameraActive ? "Rasm yuklash" : "Fayldan"}
          </span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
