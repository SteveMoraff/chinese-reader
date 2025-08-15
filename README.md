# Chinese Reader

A lightweight, browser-based tool for reading and studying Chinese text. It shows **pinyin and meanings on click or touch** (not inline), plus character-level breakdowns.

---

## Features

* Click or tap a word/character to reveal **pinyin**, **gloss**, and **character breakdown**
* Works fully client‑side (no server)
* Minimal UI focused on reading flow
* Mobile and desktop friendly

## Quick Start

1. **Download or clone** this repo.
2. Open `index.html` in a modern browser **or** serve locally:

   ```bash
   # any simple static server works; here are a few options
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```
3. Paste or open Chinese text and start clicking/tapping to see pinyin & definitions.

> **Project preference:** single-file JS. The app is designed so `index.html` bootstraps and all logic lives in `script.js` (no separate CSS/HTML required beyond the bare shell).

## How It Works (high level)

* The reader tokenizes text into words/characters.
* On **click/touch**, it looks up the selection, then displays:

  * **Pinyin** for the selected token
  * **Definition** (dictionary-backed)
  * **Character breakdown**: component characters with brief meanings
* Optional **text-to-speech** hook can read the selected token aloud.

## Keyboard & Touch

* **Click / Tap**: show pinyin + definition overlay for the token
* **Esc / Tap outside**: dismiss overlay
* **Arrow keys** (optional): move selection to previous/next token

## File Layout

```
/ (repo root)
├─ index.html        # tiny bootstrap that loads script.js
├─ script.js         # the entire app (UI + logic)
├─ data/             # optional dictionaries, frequency lists, etc.
├─ assets/           # optional icons / audio
└─ README.md         # this file
```

## Configuration

* **Dictionaries**: point `script.js` to your preferred dictionary JSON (e.g., CC-CEDICT format) under `data/`.
* **Display mode**: choose per‑click overlays (default) vs. side panel details.
* **Fonts**: the app chooses a legible CJK font stack; override in `script.js` if desired.

## Roadmap

* Sentence‑by‑sentence playback
* Per‑character stroke order hints
* Export annotated text (with footnoted pinyin) to Markdown/PDF
* Frequency-based highlighting

## Contributing

Pull requests are welcome. For larger changes, please open an issue first to discuss direction.

1. Fork → create a feature branch → commit → PR
2. Prefer small, focused changes with clear commit messages

## License

[MIT](LICENSE) — © Steve Moraff. Do anything you want, just keep the license and attribution.
# chinese-reader
