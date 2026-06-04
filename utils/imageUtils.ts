/**
 * Helper to determine the image source.
 * If the image string starts with a web protocol (http/https), a slash, or a dot,
 * it is treated as a standard URL. Otherwise, it is assumed to be a base64-encoded string
 * and prepended with the data:image/jpeg;base64 header.
 */
export const getImageUrl = (imageStr: string | null | undefined): string => {
  if (!imageStr) return '';
  if (
    imageStr.startsWith('data:') ||
    imageStr.startsWith('http://') ||
    imageStr.startsWith('https://') ||
    imageStr.startsWith('/') ||
    imageStr.startsWith('.')
  ) {
    return imageStr;
  }
  return `data:image/jpeg;base64,${imageStr}`;
};
