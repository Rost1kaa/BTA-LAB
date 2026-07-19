import "server-only";

const signatures: Record<string, readonly number[][]> = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/webp": [
    [0x52, 0x49, 0x46, 0x46],
  ],
};

export const allowedImageExtensionsByMime: Record<string, readonly string[]> = {
  "image/webp": ["webp"],
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
};

export async function validateUploadedImage(file: File, maxSizeBytes: number) {
  const allowedExtensions = allowedImageExtensionsByMime[file.type];
  const originalExtension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions || !allowedExtensions.includes(originalExtension)) {
    return "Invalid image. Upload a WebP, PNG, or JPEG file with a matching extension.";
  }

  if (file.size === 0) {
    return "The selected image is empty.";
  }

  if (file.size > maxSizeBytes) {
    return `File too large. Maximum size is ${Math.floor(maxSizeBytes / 1024 / 1024)}MB.`;
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hasValidSignature = signatures[file.type]?.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );
  const isValidWebp =
    file.type === "image/webp" &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (!hasValidSignature || (file.type === "image/webp" && !isValidWebp)) {
    return "Invalid image content. The file signature does not match its declared type.";
  }

  return null;
}
