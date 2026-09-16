export const A4_MM_PER_PIXEL = 190 / 800;
export function a4Tiles(width, height) {
  const tiles = [];
  const tileHeight = Math.floor(277 / A4_MM_PER_PIXEL);
  for (let y = 0; y < height; y += tileHeight) {
    for (let x = 0; x < width; x += 800) {
      tiles.push({ x, y, width: Math.min(800, width - x), height: Math.min(tileHeight, height - y) });
    }
  }
  return tiles;
}

export async function paginateA4(shots) {
  const result = [];
  for (const shot of shots) {
    const img = new Image();
    img.src = shot.url;
    await img.decode();
    for (const tile of a4Tiles(shot.w, shot.h)) {
      const canvas = document.createElement('canvas');
      const ratio = img.width / shot.w;
      canvas.width = Math.ceil(tile.width * ratio);
      canvas.height = Math.ceil(tile.height * ratio);
      canvas.getContext('2d').drawImage(img, tile.x * ratio, tile.y * ratio, tile.width * ratio, tile.height * ratio, 0, 0, canvas.width, canvas.height);
      result.push({ ...shot, url: canvas.toDataURL('image/png'), w: tile.width, h: tile.height });
    }
  }
  return result;
}
