/**
 * Auto-adjusts, scales, and optimizes uploaded images in the browser.
 * Ensures crisp resolution without overflowing LocalStorage or Firebase quotas.
 */
export async function autoAdjustImage(
  file: File,
  maxDimension: number = 1920,
  quality: number = 0.88
): Promise<{ dataUrl: string; width: number; height: number; size: string }> {
  return new Promise((resolve, reject) => {
    // If SVG, return as is
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          width: 800,
          height: 800,
          size: `${Math.round(file.size / 1024)} KB`
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to original data URL if decode fails
        resolve({
          dataUrl: e.target?.result as string,
          width: 800,
          height: 600,
          size: `${Math.round(file.size / 1024)} KB`
        });
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Auto-scale to crisp maxDimension while preserving original aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            width: img.width,
            height: img.height,
            size: `${Math.round(file.size / 1024)} KB`
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const estBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeStr =
          estBytes > 1024 * 1024
            ? `${(estBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(estBytes / 1024)} KB`;

        resolve({
          dataUrl,
          width,
          height,
          size: sizeStr
        });
      };

      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
