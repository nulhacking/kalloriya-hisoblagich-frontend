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
      setCameraError(null);
      setCameraPermissionDenied(false);
      setPermissionState("granted");

      // Video elementga stream-ni ulash va haqiqatan ijro etilguncha kutish.
      // Aks holda ayrim brauzerlarda birinchi martada qora ekran chiqadi.
      const attachStream = async () => {
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.muted = true;
        (video as any).playsInline = true;

        const waitReady = new Promise<void>((resolve) => {
          if (video.readyState >= 2) {
            resolve();
            return;
          }
          const onReady = () => {
            video.removeEventListener("loadedmetadata", onReady);
            video.removeEventListener("canplay", onReady);
            resolve();
          };
          video.addEventListener("loadedmetadata", onReady);
          video.addEventListener("canplay", onReady);
        });

        await waitReady;

        try {
          await video.play();
        } catch (playErr) {
          // autoplay bloklansa ham stream tayyor — UI ko'rinadi
          console.warn("video.play() failed:", playErr);
        }

        setCameraActive(true);
      };

      // Video ref hali mount bo'lmagan bo'lishi mumkin — keyingi frame'da urinib ko'ramiz
      if (videoRef.current) {
        await attachStream();
      } else {
        requestAnimationFrame(() => {
          void attachStream();
        });
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
        <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto max-h-[50vh] md:max-h-[60vh] object-contain mx-auto bg-white"
          />
          {/* Success indicator */}
          <div className="absolute top-3 right-3 bg-stone-900/80 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
            Tayyor
          </div>
        </div>
      ) : (
        <div className="relative h-[50vh] md:h-[55vh] w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-900">
          {/* Error Message - shown when camera fails */}
          {cameraError && (
            <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <p className="text-sm text-stone-600 leading-relaxed">
                  {cameraError}
                </p>
                {cameraPermissionDenied && (
                  <button
                    onClick={startCamera}
                    className="mt-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors active:scale-[0.99]"
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
              <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-6">
                <p className="text-base font-semibold text-stone-900 text-center">
                  Kamera yoqilmagan
                </p>
                <p className="text-stone-500 text-xs mt-1.5 mb-5 text-center max-w-xs leading-relaxed">
                  {permissionState === "denied"
                    ? "Ruxsat rad etilgan. Brauzer sozlamalaridan ruxsat bering yoki rasm yuklang."
                    : "Ovqatni darhol suratga olish uchun kamerani yoqing."}
                </p>
                <button
                  onClick={startCamera}
                  disabled={disabled}
                  className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors active:scale-[0.99]"
                >
                  Kamerani yoqish
                </button>
              </div>
            )}

          {/* Skeleton — faqat ruxsat berilgan, kamera hali yuklanmoqda holatida */}
          {!cameraActive &&
            !cameraError &&
            (permissionState === "granted" ||
              permissionState === "checking") && (
              <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-500 animate-spin" />
                <p className="mt-4 text-sm text-stone-500">
                  Kamera yuklanmoqda…
                </p>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          )}

          {/* Camera frame corners */}
          {cameraActive && (
            <div className="absolute inset-8 md:inset-12 pointer-events-none">
              <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white/70 rounded-tl-md"></div>
              <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white/70 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white/70 rounded-bl-md"></div>
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white/70 rounded-br-md"></div>
            </div>
          )}

          {/* Camera status indicator */}
          {cameraActive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-[10px] font-semibold tracking-wide">
                LIVE
              </span>
            </div>
          )}

          {/* Instruction text */}
          {cameraActive && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white text-xs bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full">
                Ovqatni kadrga oling
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
            className="flex-1 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-colors active:scale-[0.99] disabled:active:scale-100"
          >
            Rasm olish
          </button>
        )}

        {/* File Upload Button - always available */}
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`${
            cameraError && !cameraActive ? "w-full" : "flex-1"
          } border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-50 text-stone-700 font-semibold text-sm py-3 px-4 rounded-xl transition-colors active:scale-[0.99] disabled:active:scale-100`}
        >
          {cameraError && !cameraActive ? "Rasm yuklash" : "Fayldan"}
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
