const MAX_EDGE = 1280
const JPEG_QUALITY = 0.8
const SKIP_UNDER_BYTES = 250 * 1024

/** Shrink HD photos so a batch of 5 stays under typical reverse-proxy upload limits. */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!(file instanceof File) || !file.type.startsWith("image/")) return file
  if (file.size <= SKIP_UNDER_BYTES) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((next) => resolve(next), "image/jpeg", JPEG_QUALITY)
    })
    if (!blob || blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, "") || "staff-photo"
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() })
  } catch {
    return file
  }
}
