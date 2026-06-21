// Client-side image compression utility
// Compresses images to max 1200px width and JPEG quality 85%
// This ensures even large camera photos (5MB+) become ~200-400KB before upload

export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("الملف ليس صورة"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("فشل في إنشاء سياق الكانفاس"));
          return;
        }

        // Fill black background (for PNGs with transparency)
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG data URL (smaller than PNG)
        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        // Check final size
        const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
        console.log(`Image compressed: ${file.size / 1024}KB → ${sizeKB}KB`);

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("فشل في تحميل الصورة"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("فشل في قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
