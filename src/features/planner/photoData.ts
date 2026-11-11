// Store small raster images with the planner so backups do not contain temporary file paths.
export const MAX_PHOTO_CHARS = 250000;
export function photoData(value: unknown): string | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || value.length > MAX_PHOTO_CHARS ||
      !/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw Error('Invalid photo. Choose a new JPG or PNG image.');
  }
  return value;
}
export function utf8Bytes(value: string): number {
  let size = 0;
  for (const character of value) {
    const point = character.codePointAt(0)!;
    size += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
  }
  return size;
}
