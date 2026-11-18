import dimensions from '../data/imageDimensions.json';

/** Reserve the natural aspect ratio before a local image is downloaded. */
export function imageSize(src: string) {
  return (dimensions as Record<string, { width: number; height: number }>)[src] ?? {};
}
