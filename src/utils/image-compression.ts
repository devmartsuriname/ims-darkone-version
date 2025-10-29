/**
 * Client-side Image Compression Utility
 * Optimizes images before upload to reduce bandwidth and storage costs
 * Target: 80% quality, max 1920px width, WebP format when supported
 */

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  targetFormat?: 'jpeg' | 'webp' | 'png'
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  targetFormat: 'jpeg'
}

/**
 * Compress an image file
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const compressed = resizeAndCompress(img, opts, file.name)
          resolve(compressed)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Resize and compress image using canvas
 */
function resizeAndCompress(
  img: HTMLImageElement,
  options: CompressionOptions,
  originalName: string
): File {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Calculate new dimensions
  let { width, height } = img
  const maxWidth = options.maxWidth!
  const maxHeight = options.maxHeight!

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }

  // Set canvas size
  canvas.width = width
  canvas.height = height

  // Draw image with high quality
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)

  // Convert to blob
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'))
          return
        }

        // Create new file with compressed data
        const extension = options.targetFormat === 'webp' ? 'webp' : 
                         options.targetFormat === 'png' ? 'png' : 'jpg'
        const name = originalName.replace(/\.[^/.]+$/, `.${extension}`)
        const mimeType = `image/${options.targetFormat}`
        
        const compressedFile = new File([blob], name, { type: mimeType })
        resolve(compressedFile)
      },
      `image/${options.targetFormat}`,
      options.quality
    )
  }) as unknown as File
}

/**
 * Batch compress multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      return Promise.resolve(file)
    }
    return compressImage(file, options)
  })

  return Promise.all(compressionPromises)
}

/**
 * Calculate compression ratio
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Compression ratio percentage
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

/**
 * Get optimal format for browser
 */
export function getOptimalFormat(): 'webp' | 'jpeg' {
  return supportsWebP() ? 'webp' : 'jpeg'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
