// Responsive `srcSet` for catalogue images. Tour/destination/deal images are
// Unsplash URLs with a fixed `w=900`; Unsplash resizes on the fly via the
// `w` parameter, so a card that is 300px wide can fetch a 400/600px file
// instead. URLs from any other host (e.g. an admin-entered link) are left
// untouched — only `src` is returned.

const UNSPLASH_HOST = 'images.unsplash.com';

function withWidth(url, width) {
  url.searchParams.set('w', String(width));
  return url.toString();
}

/**
 * @param {string} src     original image URL
 * @param {number[]} widths candidate widths, ascending
 * @param {string} sizes   the `sizes` attribute matching the layout
 * @returns {{ src: string, srcSet?: string, sizes?: string }}
 */
export function responsiveImage(src, widths, sizes) {
  let url;
  try {
    url = new URL(src);
  } catch {
    return { src };
  }
  if (url.hostname !== UNSPLASH_HOST) return { src };

  // Never ask for more than the original URL requested (it was chosen as
  // the largest size the design needs).
  const max = Number(url.searchParams.get('w')) || Infinity;
  const candidates = widths.filter((w) => w < max);
  if (Number.isFinite(max)) candidates.push(max);
  if (candidates.length < 2) return { src };

  return {
    src,
    srcSet: candidates.map((w) => `${withWidth(new URL(src), w)} ${w}w`).join(', '),
    sizes,
  };
}

// Shared presets. `sizes` follow the grid breakpoints in the matching CSS
// (container max 1240px); where an image is object-fit: cover in a box
// taller than 2:3, the slot width is raised so a landscape photo still
// covers the box's height without upscaling.
export const CARD_WIDTHS = [400, 600, 900];
// .tours-grid / .featured-tours-grid / .deals-grid: 1 → 2 → 3 columns.
export const CARD_SIZES = '(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 400px';
// /destinations: 1 → 2 columns, 330px-tall media.
export const DESTINATION_CARD_SIZES = '(max-width: 680px) 100vw, 620px';
// Homepage .dest-grid: 1 → 2 → 3 → 4 columns, 240px-tall media.
export const COMPACT_CARD_SIZES = '(max-width: 560px) 100vw, (max-width: 860px) 50vw, 360px';
export const THUMB_WIDTHS = [200, 400];
export const GALLERY_WIDTHS = [400, 700];

// Gallery tiles: 4 columns × 190px rows (2 columns under 720px); tall tiles
// span two rows, wide ones two columns.
export function gallerySizes(sizeClass) {
  if (sizeClass === 'g-tall' || sizeClass === 'g-wide') return '(max-width: 720px) 100vw, 640px';
  return '(max-width: 720px) 50vw, 320px';
}
