import textFit from './textFit.js';

export let chineseWords = new Map();  // Define chineseWords as a Map for efficient lookup
export let chinesePhrases = new Map();  // Define chineseWords as a Map for efficient lookup

export function entry(text) {
    // Split the text into parts
    const parts = text.split(' /');
    
    // Extract the traditional and simplified characters (first part)
    const [tradSimp, pinyin] = parts[0].split('[');
    const [trad, simp] = tradSimp.trim().split(' ');

    // Extract the pinyin (remove closing bracket from it)
    const cleanPinyin = pinyin.trim().replace(']', '');

    // Extract the definitions (each definition is separated by '/')
    const defs = parts[1].split('/').filter(def => def.trim() !== '');

    // Return an object representing the entry
    return {
        trad: trad,    // Traditional Chinese characters
        simp: simp,    // Simplified Chinese characters
        pinyin: cleanPinyin, // Pinyin
        defs: defs     // Array of definitions
    };
}

const toneMap = {
    'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à',
    'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è',
    'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì',
    'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò',
    'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù',
    'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ'
};

function applyToneMark(pinyinSyllable) {
    // Identify vowels in priority order for tone marking
    const vowels = ['a', 'e', 'o', 'i', 'u', 'v'];
    
    // Search for the tone number (1-5) at the end of the syllable
    const tone = pinyinSyllable.match(/[1-5]$/);
    
    // If there's no tone number, return the syllable as is
    if (!tone) return pinyinSyllable;
    
    const toneNumber = tone[0];  // Extract the tone number
    
    // Remove the tone number from the syllable
    const syllableWithoutTone = pinyinSyllable.slice(0, -1);
    
    // If the tone is 5 (indicating no tone), return the syllable without the number
    if (toneNumber === '5') {
        return syllableWithoutTone;
    }
    
    // Determine which vowel gets the tone mark
    for (let vowel of vowels) {
        if (syllableWithoutTone.includes(vowel)) {
            // Replace the vowel with its tone-marked counterpart
            return syllableWithoutTone.replace(vowel, toneMap[vowel + toneNumber]);
        }
    }
    
    // If no matching vowel found, return the original syllable
    return pinyinSyllable;
}

// Function to convert full Pinyin phrase to tone-marked Pinyin
function convertToToneMarks(pinyin) {
    return pinyin.split(' ').map(applyToneMark).join('');
}

export function wordToPinyin(word) {
    // Retrieve all entries for the word from the chineseWords Map
    if (chineseWords.has(word)) {
        const entries = chineseWords.get(word);
        return convertToToneMarks(entries[0].pinyin);  // Convert numeric tones to tone marks of the first match
    } else {
        return null; // Return null if the word is not found
    }
}

export function wordToEnglish(word) {
    if (chineseWords.has(word)) {
        let definitions = [];
        const entries = chineseWords.get(word);
        entries.forEach(entry => {
            definitions.push(...entry.defs);
        });
        return [...new Set(definitions)];  // Remove duplicates
    } else {
        return null; // Return null if the word is not found
    }
}

export function searchChineseWords(subset) {
    let result = [];

    for (let [key, entries] of chineseWords) {
        if (key.includes(subset)) {
            entries.forEach(entry => {
                // Construct a unique array for each entry
                let uniqueEntry = [
                    key,  // Chinese word
                    convertToToneMarks(entry.pinyin),  // Pinyin with tonal characters
                    entry.defs  // English translations
                ];
                if (!result.some(e => JSON.stringify(e) === JSON.stringify(uniqueEntry))) {
                    result.push(uniqueEntry);
                }
            });
        }
    }

    // Return the result without removing duplicates
    return result;
}

export function searchExactChineseWords(subset) {
    let result = [];

    for (let [key, entries] of chineseWords) {
        if (key === subset) {
            entries.forEach(entry => {
                // Construct a unique array for each entry
                let uniqueEntry = [
                    key,  // Chinese word
                    convertToToneMarks(entry.pinyin),  // Pinyin with tonal characters
                    entry.defs  // English translations
                ];
                if (!result.some(e => JSON.stringify(e) === JSON.stringify(uniqueEntry))) {
                    result.push(uniqueEntry);
                }
            });
        }
    }

    return result;
}


let currentSpeech = null;

export function speakChinese(text, rate = 1, pitch = 1, callback = null) {
    // If there's an ongoing speech, cancel it before starting a new one
    if (currentSpeech) {
        window.speechSynthesis.cancel();
    }

    // Split text into smaller chunks for better handling
    const chunkSize = 20; // Adjust chunk size if necessary
    const textChunks = text.match(/[^，。]{1,20}[，。]|.{1,20}/g);

    let currentChunkIndex = 0;

    function speakNextChunk() {
        if (currentChunkIndex < textChunks.length) {
            const chunk = textChunks[currentChunkIndex];
            const nextSpeech = new SpeechSynthesisUtterance(chunk);
            nextSpeech.lang = 'zh-CN';
            nextSpeech.rate = rate;
            nextSpeech.pitch = pitch;

            nextSpeech.onend = () => {
                currentChunkIndex++;
                // Call speakNextChunk immediately after the previous chunk finishes
                speakNextChunk();
            };

            // Speak the chunk immediately
            window.speechSynthesis.speak(nextSpeech);
            currentSpeech = nextSpeech;
        } else {
            currentSpeech = null; // Clear reference once finished
            if (callback && typeof callback === 'function') {
                callback(); // Call the callback function when finished
            }
        }
    }

    // Start speaking the first chunk
    speakNextChunk();
}

export function stopSpeaking() {
    window.speechSynthesis.cancel();
    currentSpeech = null;
}

/**
 * Prepares chunks from the given text.
 * @param {string} text - The input text to be chunked.
 * @param {number} chunkSize - The maximum size of each chunk (default is 20 characters).
 * @returns {Array} - An array of text chunks.
 */
export function prepareChunks(text) {
    // Split the text into smaller chunks based on punctuation and length
    return text.match(/[^，。]{1,20}[，。]|.{1,20}/g) || [text];
}

/**
 * Speaks the prepared chunks.
 * @param {Array} chunks - An array of text chunks to be spoken.
 * @param {number} rate - The speech rate (default is 1).
 * @param {number} pitch - The speech pitch (default is 1).
 * @param {function} callback - A callback function to be called when all chunks are spoken.
 */
export function speakChunks(chunks, rate = 1, pitch = 1, callback = null) {
    let currentChunkIndex = 0;

    function speakNextChunk() {
        if (currentChunkIndex < chunks.length) {
            const nextSpeech = new SpeechSynthesisUtterance(chunks[currentChunkIndex]);
            nextSpeech.lang = 'zh-CN';
            nextSpeech.rate = rate;  // Set speech rate
            nextSpeech.pitch = pitch; // Set speech pitch
            nextSpeech.onend = () => {
                currentChunkIndex++;
                speakNextChunk(); // Speak the next chunk immediately
            };
            nextSpeech.onerror = () => {
                currentSpeech = null;
                if (callback && typeof callback === 'function') {
                    callback(); // Call the callback function in case of an error
                }
            };

            // Set the current speech to manage cancellation if needed
            currentSpeech = nextSpeech;
            window.speechSynthesis.speak(nextSpeech);
        } else {
            currentSpeech = null; // Clear reference once finished
            if (callback && typeof callback === 'function') {
                callback(); // Call the callback function when all chunks are finished
            }
        }
    }

    // If there's an ongoing speech, cancel it before starting a new one
    if (currentSpeech) {
        window.speechSynthesis.cancel();
    }

    // Start speaking the first chunk
    speakNextChunk();
}
export function styleButton(element) {
	element.style.border = "2px solid gray"; // Remove default border
	element.style.borderRadius = "5px"; // Round the corners
	element.style.color = 'black';
	element.style.textShadow = '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white';
	element.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
	
	// Add a hover effect
	element.addEventListener("mouseover", function() {
	  element.style.backgroundColor = 'rgba(200, 200, 200, 0.4)'; // Slightly darker shade on hover
	});

	// Revert the hover effect when the mouse leaves
	element.addEventListener("mouseout", function() {
		element.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; // Original background color
	});

	// Add a pressed effect
	element.addEventListener("mousedown", function() {
	  element.style.backgroundColor = 'rgba(130, 160, 190, 0.5)'; // Even darker shade to simulate a press
	});

	// Revert the pressed effect when the mouse button is released
	element.addEventListener("mouseup", function() {
	  element.style.backgroundColor = 'rgba(200, 200, 200, 0.4)'; // Go back to the hover color
	});

	textFit(element, { multiLine: false });
}

export function fitTextInElement(element, text) {
    element.textContent = text;
    textFit(element, { multiLine: false });
}