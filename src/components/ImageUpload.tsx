import { useRef } from "react";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : imagePreview
              ? "border-primary-300 bg-primary-50"
              : "border-primary-300 bg-primary-50 hover:border-primary-400 hover:bg-primary-100"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {imagePreview ? (
          <div className="space-y-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
            />
            <p className="text-sm text-gray-600">Rasmni o'zgartirish uchun bosing</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Yuklash uchun bosing yoki sudrab tashlang
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG yoki PNG (maksimal 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
