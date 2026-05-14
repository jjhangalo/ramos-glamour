import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    return file; // Return original if compression fails
  }
}

export async function compressImages(files: FileList | File[]) {
  const fileArray = Array.from(files);
  const compressedFiles: File[] = [];
  
  let totalSize = 0;
  const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB

  for (const file of fileArray) {
    const compressed = await compressImage(file);
    if (totalSize + compressed.size > MAX_TOTAL_SIZE) {
      break; // Stop if total size exceeds limit
    }
    compressedFiles.push(compressed);
    totalSize += compressed.size;
  }

  return {
    files: compressedFiles,
    totalSize,
    skippedCount: fileArray.length - compressedFiles.length,
  };
}
