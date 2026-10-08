/**
 * Image Auto-Adjuster & Compressor Utility
 * Automatically scales, optimizes, and prepares images for blogs, galleries, and doctor profile
 */

export interface ProcessedImageResult {
  dataUrl: string;
  name: string;
  size: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface AdjustImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function adjustAndProcessUploadedImage(
  file: File,
  options: AdjustImageOptions = {}
): Promise<ProcessedImageResult> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.88 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Empty image payload'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to original raw dataUrl if decoding fails
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
        resolve({
          dataUrl: rawDataUrl,
          name: file.name,
          size: sizeStr,
          width: 800,
          height: 600,
          aspectRatio: 800 / 600
        });
      };

      img.onload = () => {
        let originalWidth = img.naturalWidth || img.width;
        let originalHeight = img.naturalHeight || img.height;

        if (originalWidth === 0 || originalHeight === 0) {
          originalWidth = 800;
          originalHeight = 600;
        }

        const aspectRatio = originalWidth / originalHeight;

        // Auto-adjust dimensions to fit max constraints while keeping aspect ratio intact
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = Math.round(targetWidth / aspectRatio);
        }

        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = Math.round(targetHeight * aspectRatio);
        }

        // Create offscreen canvas for auto-adjustment and compression
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const sizeStr = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;
          resolve({
            dataUrl: rawDataUrl,
            name: file.name,
            size: sizeStr,
            width: originalWidth,
            height: originalHeight,
            aspectRatio
          });
          return;
        }

        // High quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Determine best output format (preserve transparency for PNG, otherwise JPEG for high efficiency)
        const isPngWithAlpha = file.type === 'image/png';
        const mimeType = isPngWithAlpha ? 'image/png' : 'image/jpeg';

        let processedDataUrl: string;
        try {
          processedDataUrl = canvas.toDataURL(mimeType, quality);
        } catch {
          processedDataUrl = rawDataUrl;
        }

        // Calculate approximate size
        const base64Length = processedDataUrl.length - (processedDataUrl.indexOf(',') + 1);
        const approxBytes = Math.round(base64Length * 0.75);
        const sizeStr = approxBytes > 1024 * 1024
          ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(approxBytes / 1024)} KB`;

        resolve({
          dataUrl: processedDataUrl,
          name: file.name,
          size: sizeStr,
          width: targetWidth,
          height: targetHeight,
          aspectRatio
        });
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
