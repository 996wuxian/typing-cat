// Outline paths from Tabler Icons (MIT), https://tabler.io/icons.
export const keyIcons = Object.freeze({
  Backspace: ['M20 6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-11l-5 -5a1.5 1.5 0 0 1 0 -2l5 -5l11 0', 'M12 10l4 4m0 -4l-4 4'],
  Enter: ['M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4'],
  ArrowUp: ['M12 5v14', 'M18 11l-6 -6', 'M6 11l6 -6'],
  ArrowDown: ['M12 5v14', 'M18 13l-6 6', 'M6 13l6 6'],
  ArrowLeft: ['M5 12h14', 'M5 12l6 6', 'M5 12l6 -6'],
  ArrowRight: ['M5 12h14', 'M13 18l6 -6', 'M13 6l6 6'],
});

export function paintKeyIcon(context, code, x, y, size) {
  context.save();
  context.translate(x - size / 2, y - size / 2);
  context.scale(size / 24, size / 24);
  context.lineWidth = 2.25;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const path of keyIcons[code]) context.stroke(new Path2D(path));
  context.restore();
}

export function keyIconElement(code) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  for (const [attribute, value] of Object.entries({
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
  })) icon.setAttribute(attribute, value);
  for (const data of keyIcons[code]) {
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', data);
    icon.append(path);
  }
  return icon;
}
