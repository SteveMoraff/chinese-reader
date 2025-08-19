// CharacterBox.js
export class CharacterBox {
  constructor({ char, parentEl, onClick }) {
    this.char = char;
    this.charSpan = document.createElement('span');
    this.charSpan.textContent = char;
    this.charSpan.style.cursor = 'pointer';
    this.charSpan.style.display = 'inline-block';
    parentEl.appendChild(this.charSpan);

    if (typeof onClick === 'function') {
      this.charSpan.addEventListener('click', onClick);
    }
  }
  setColor(c) { this.charSpan.style.color = c; }
  setBold(on) { this.charSpan.style.fontWeight = on ? 'bold' : 'normal'; }
}
