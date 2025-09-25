export const resizeLogoMaintainAspectRatio = (
  sourceImage: HTMLImageElement,
  targetHeight: number,
  targetWidth?: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  const aspectRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
  
  if (targetWidth) {
    // For small logo (24x24) - center the logo within the square
    canvas.width = targetWidth;
    canvas.height = targetWidth;
    
    // Calculate size to fit within square while maintaining aspect ratio
    let drawWidth = targetWidth;
    let drawHeight = targetWidth / aspectRatio;
    
    if (drawHeight > targetWidth) {
      drawHeight = targetWidth;
      drawWidth = targetWidth * aspectRatio;
    }
    
    // Center the logo
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetWidth - drawHeight) / 2;
    
    ctx.drawImage(sourceImage, x, y, drawWidth, drawHeight);
  } else {
    // For normal logos - maintain aspect ratio based on height
    canvas.height = targetHeight;
    canvas.width = Math.round(targetHeight * aspectRatio);
    
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
};

export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png', 1.0);
  });
};