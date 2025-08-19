// WordBox.js
import { CharacterBox } from './CharacterBox.js';

export class WordBox {
  /**
   * @param {object} args
   * @param {string} args.word
   * @param {HTMLElement} args.parentEl        // paragraph div
   * @param {number} args.index                // word index in paragraph
   * @param {number} args.paragraphIndex
   * @param {object} args.deps
   *   deps = {
   *     prepareChunks, speakChunks, stopSpeaking,
   *     getSpeed, getPitch, getWordBox,
   *     onSelectWord: (wb) => void,           // UI select callback
   *     onCharClick: ({wb,charIndex}) => void // per-char click callback
   *   }
   */
  constructor({ word, parentEl, index, paragraphIndex, deps }) {
    this.word = word;
    this.index = index;
    this.paragraphIndex = paragraphIndex;
    this.deps = deps;

    this.wrapper = document.createElement('span');
    this.wrapper.style.display = 'inline-block';
    this.wrapper.style.marginRight = '0.4em';
    parentEl.appendChild(this.wrapper);

    this.charBoxes = [];
    [...word].forEach((ch, i) => {
      const cb = new CharacterBox({
        char: ch,
        parentEl: this.wrapper,
        onClick: () => {
          if (this.deps?.onSelectWord) this.deps.onSelectWord(this);
          if (this.deps?.onCharClick) this.deps.onCharClick({ wb: this, charIndex: i });
        }
      });
      this.charBoxes.push(cb);
    });
  }

  setHighlighted(on) {
    this.charBoxes.forEach(cb => {
      cb.setColor(on ? 'blue' : 'black');
      cb.setBold(on);
    });
  }

  speak() {
    const { prepareChunks, speakChunks, stopSpeaking, getSpeed, getPitch, getWordBox } = this.deps;
    stopSpeaking();
    this.charBoxes.forEach(cb => cb.setColor('red'));

    const chunks = prepareChunks(this.word);
    const next = this.index + 1;

    speakChunks(chunks, getSpeed(), getPitch(), () => {
      this.charBoxes.forEach(cb => cb.setColor('black'));
      if (getWordBox && getWordBox(next)) getWordBox(next).speak();
    });
  }
}
