// dom.js
export function makeChild(tag, parent, id, L, T, W, H) {
  const el = document.createElement(tag);
  if (id != null) el.id = id;
  el.style.position = 'absolute';
  el.style.left = L + '%';
  el.style.top = T + '%';
  el.style.width = W + '%';
  el.style.height = H + '%';
  parent.appendChild(el);
  return el;
}

export function makeChildInput(type, parent, id, L, T, W, H) {
  const el = makeChild('input', parent, id, L, T, W, H);
  el.type = type;
  return el;
}

export function makeDiv(text, parent, id, L, T, W, H, scroll) {
  const div = makeChild('div', parent, id, L, T, W, H);
  if (text != null) div.textContent = text;
  if (scroll) div.style.overflowY = 'scroll';
  return div;
}

export function addBorder(el, width, style, color) {
  el.style.borderWidth = width;
  el.style.borderStyle = style;
  el.style.borderColor = color;
}

export function applyStyles(element, styles) {
  Object.assign(element.style, styles);
}
