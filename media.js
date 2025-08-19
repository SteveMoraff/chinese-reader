// media.js
export function loadImage(basePath, element) {
  const exts = ['.jpg', '.webp'];
  let i = 0;
  (function tryLoad() {
    if (i >= exts.length) { console.error(`Failed to load image: ${basePath}`); return; }
    const img = new Image();
    img.src = basePath + exts[i];
    Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'fill', display: 'block' });
    img.onload = () => { element.innerHTML = ''; element.appendChild(img); };
    img.onerror = () => { i++; tryLoad(); };
  })();
}

export function prepareYouTubeContainer(div) {
  const cs = window.getComputedStyle(div);
  if (cs.position === 'static') div.style.position = 'relative';
  div.style.overflow = 'hidden';
  const h = parseFloat(cs.height);
  if (!h || h === 0) { div.style.height = '0'; div.style.paddingBottom = '56.25%'; } // 16:9
}

export function embedYouTubeAtBottom(div, url) {
  if (typeof url !== 'string') url = url?.href ?? '';
  const m = url.match(/(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!m) { console.error('Invalid YouTube URL'); return; }
  const embedUrl = `https://www.youtube.com/embed/${m[1]}`;
  const cs = window.getComputedStyle(div);
  if (cs.position === 'static') div.style.position = 'relative';
  if (!div.style.height || div.style.height === '0px') div.style.height = '315px';
  div.innerHTML = `<iframe src="${embedUrl}" style="position:absolute;bottom:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

export async function getUrlFromPath(path) {
  if (!path.endsWith('/')) path += '/';
  try {
    const res = await fetch(path + 'url.txt');
    return res.ok ? await res.text() : null;
  } catch { return null; }
}
