// Import the function from program.js
import { makeChild, makeChildInput, makeDiv, addBorder, applyStyles } from './dom.js';
import { loadImage, prepareYouTubeContainer, embedYouTubeAtBottom, getUrlFromPath } from './media.js';
import { WordBox } from './WordBox.js';
import { chineseWords, chinesePhrases, entry, wordToPinyin, wordToEnglish, searchChineseWords, searchExactChineseWords, speakChinese, prepareChunks, speakChunks, styleButton, fitTextInElement, stopSpeaking } from './program.js';
import textFit from './textFit.js';

let pinyinDict = {};
let storyPath = 'stories/';
let songPath = 'songs/';
let defaultStory = '悟空/';
let chapterNumber = '1';
let currentStory = defaultStory + chapterNumber;
let englishVersions = [];
let 中文Versions = [];
let readingLevel = '6';
let songURL = null;

// Function to load all text files in a folder using PHP
function loadFileList(folderPath) {
    return new Promise((resolve, reject) => {
        fetch(`list_files.php?path=${encodeURIComponent(folderPath)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(files => {
                englishVersions = [];
                中文Versions = [];
                englishVersions = files.filter(file => file.includes('English.txt'));
                中文Versions = files.filter(file => file.includes('中文.txt'));
                resolve([englishVersions, 中文Versions]);
            })
            .catch(reject);
    });
}

/**
 * Fetches a list of files from the specified path.
 * @param {string} path - The file path to fetch the file list from.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of file names.
 */
async function fileList(path) {
    try {
        const response = await fetch(`list_files.php?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const files = await response.json(); // Assuming the response is a JSON array
        return files;
    } catch (error) {
        console.error(`Error fetching file list from ${path}:`, error);
        return []; // Return an empty array on failure
    }
}

/**
 * Fetches a list of folders from the specified path.
 * @param {string} path - The directory path to fetch the folder list from.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of folder names.
 */
async function folderList(path) {
    try {
        const response = await fetch(`list_folders.php?path=${encodeURIComponent(path)}&t=${Date.now()}`);
        //const response = await fetch(`list_folders.php?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const folders = await response.json(); // Assuming the response is a JSON array
        return folders;
    } catch (error) {
        console.error(`Error fetching folder list from ${path}:`, error);
        return []; // Return an empty array on failure
    }
}

async function loadChapter(story) {
    try {
        await updatePhrasesForChapter(storyPath + story); // Adjust path as needed
        await loadFileList(storyPath + story);
        await loadTextFileToArray(storyPath + story + '/' + readingLevel + '中文.txt', chineseParagraphs, true);
        await loadTextFileToArray(storyPath + story + '/' + readingLevel + 'English.txt', englishVersion, false);
    } catch (error) {
        console.error('Error loading chapter:', error);
    }
}



// Function to load a JSON file into a Map
async function loadPhrasesFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return new Map(Object.entries(data));
    } catch (error) {
        console.error(`There was a problem loading the JSON file (${filePath}):`, error);
        return new Map();
    }
}

// Example usage for loading phrases
async function updatePhrasesForChapter(chapterPath) {
    const loadedPhrases = await loadPhrasesFromFile(`${chapterPath}/phrasesChinese.json`);
    chinesePhrases.clear();
    loadedPhrases.forEach((value, key) => {
        chinesePhrases.set(key, value);
    });
    console.log("Updated phrases:", chinesePhrases);
}

// Update `window.onload` to use the new function
window.onload = async () => {
    try {
        const pinyinResponse = await fetch('pinyin.json');
        const pinyinData = await pinyinResponse.json();
        pinyinDict = pinyinData; // Store the data in pinyinDict


        //const levelsResponse = await fetch('list_files.php');
        //const levels = await levelsResponse.json();

        await loadChineseWords();
        console.log("Chinese words loaded and processed.");

        await loadChapter(currentStory);
        program(); // Only called after loadChapter() is complete
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};


let chineseParagraphs = [];
let englishVersion = [];


let pictureNumber = [];
let pictureCounter = 0;

let currentParagraphNumber = -1;
let currentPictureNumber = -1;

// Function to load the text file and convert it into the desired array format
async function loadTextFileToArray(fName, targetArray, setPictureCounter) {
    const response = await fetch(fName);
    const text = await response.text();

    // Split the text into lines first
    const lines = text.split('\n');

    targetArray.length = 0; // Clear the array
    if (setPictureCounter) {
        pictureNumber.length = 0; // Clear the pictureNumber array
        pictureCounter = 0;
    }

    lines.forEach(line => {
        if (line === "~") {
            // Increment pictureCounter when the line contains only "~"
            pictureCounter++;
        } else if (line.length > 0) {
            targetArray.push(line);
            line = line.trim(); // Remove leading/trailing whitespace

            if (line) {
                // Split the line by "。", process only if the line is not empty
                const sentences = line.split('。').filter(sentence => sentence.trim() !== "");

                if (setPictureCounter) {
                    // Push the current pictureCounter value to pictureNumber
                    pictureNumber.push(pictureCounter);
                }
            }
        }
    });

    // Output the arrays to check the results
    console.log("Target Array: ", targetArray);
    console.log("Picture Numbers: ", pictureNumber);
}

// Function to load text from clipboard and convert it into the desired array format
async function loadClipboardTextToArray(targetArray) {
    try {
        const text = await navigator.clipboard.readText();

        // Split the text into lines first
        const lines = text.split('\n');

        targetArray.length = 0; // Clear the array

        lines.forEach(line => {
            if (line === "~") {
                // Increment pictureCounter when the line contains only "~"
                pictureCounter++;
            } else if (line.length > 0) {
                targetArray.push(line);
                line = line.trim(); // Remove leading/trailing whitespace

                if (line) {
                    // Split the line by "。", process only if the line is not empty
                    const sentences = line.split('。').filter(sentence => sentence.trim() !== "");
                }
            }
        });

        // Output the arrays to check the results
        console.log("Target Array: ", targetArray);
    } catch (error) {
        console.error("Failed to read from clipboard: ", error);
    }
}

async function loadChineseWords() {
    try {
        const response = await fetch('cedict_ts.u8');
        const data = await response.text();

        // Split the data into an array by newlines
        let dataSplit = data.split('\n').filter(line => line.trim() !== '');

        // Process each line and store the result in the chineseWords Map
        dataSplit.forEach(line => {
            if (line !== undefined) {
                let wordEntry = entry(line);  // Parse the entry
                const simp = wordEntry.simp;

                // Add the word entry to the Map, managing multiple entries
                if (!chineseWords.has(simp)) {
                    chineseWords.set(simp, []);
                }
                chineseWords.get(simp).push(wordEntry);
            }
        });

    } catch (error) {
        console.error('Error fetching file:', error);
    }
}


let isVerticalDisplay = false;

function program() {
    // Ensure no margins or padding on the body
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    // Create the main container dynamically
    let body = document.body;

    let mainText, buttonMenu, buttonNextChapter, buttonPlay, buttonLevel, buttonHarder, buttonClipboard, buttonFullScreen, buttonPrevious, buttonNext, buttonSpeaker, buttonSpeakers, buttonBrowse;
    let pinyinDiv, englishWordDiv, speedBar, pitchBar, englishDiv = null, translationDiv, translationDivText, buttonSpeakPhrase, pictureDiv;
    let browseDiv;

    let chineseSpeechSpeed = 1, chinesePitch = 1;

    function resetIllustration() {
        currentPictureNumber = -1;
        currentParagraphNumber = -1;
        setParagraph(0);
    }

    if (window.innerWidth < window.innerHeight) {
        isVerticalDisplay = true;
    }

    if (isVerticalDisplay) {
        buttonMenu = makeChild('button', body, 'menu', 0, 0, 12, 8);
        buttonNextChapter = makeChild('button', body, 'nextChapter', 12, 0, 8, 8);
        buttonPlay = makeChild('button', body, 'easier', 20, 0, 8, 8);
        buttonLevel = makeChild('button', body, 'level', 28, 0, 8, 8);
        buttonHarder = makeChild('button', body, 'harder', 36, 0, 8, 8);
        buttonClipboard = makeChild('button', body, 'clipboard', 44, 0, 8, 8);
        buttonFullScreen = makeChild('button', body, 'fullScreen', 52, 0, 8, 8);
        buttonSpeaker = makeChild('button', body, 'speak', 60, 0, 12, 8);
        buttonSpeakers = makeChild('button', body, 'speakAll', 72, 0, 21, 8);
        buttonBrowse = makeChild('button', body, 'browse', 93, 0, 7, 8);
        buttonPrevious = makeChild('button', body, 'previous', 0, 8, 8, 6);
        buttonNext = makeChild('button', body, 'next', 8, 8, 8, 6);
        pinyinDiv = makeDiv('pinyin', body, 'pinyin', 16, 8, 42, 6, true);
        englishWordDiv = makeDiv('English', body, 'english', 58, 8, 42, 6, true);
        speedBar = makeChildInput('range', body, 'pinyin', 0, 14, 50, 2, true);
        pitchBar = makeChildInput('range', body, 'english', 50, 14, 50, 2, true);
        mainText = makeDiv(null, body, 'mainText', 0, 16, 100, 38, true);
        translationDiv = makeDiv('', body, 'translation', 0, 54, 100, 45, false);
        translationDivText = makeDiv('', translationDiv, 'translation', 0, 0, 90, 100, true);
        buttonSpeakPhrase = makeChild('button', translationDiv, 'speakPhrase', 90, 0, 10, 40);
        pictureDiv = makeDiv(null, body, 'pictureDiv', 0, 54, 100, 45, false);
        browseDiv = makeDiv(null, body, 'browserDiv', 0, 54, 100, 45, true);
    } else {
        buttonMenu = makeChild('button', body, 'menu', 0, 0, 4, 5);
        buttonPlay = makeChild('button', body, 'easier', 4, 0, 3, 5);
        buttonLevel = makeChild('button', body, 'level', 7, 0, 3, 5);
        buttonHarder = makeChild('button', body, 'harder', 10, 0, 3, 5);
        buttonClipboard = makeChild('button', body, 'clipboard', 13, 0, 4, 5);
        buttonFullScreen = makeChild('button', body, 'fullScreen', 17, 0, 5, 5);
        buttonPrevious = makeChild('button', body, 'previous', 22, 0, 5, 5);
        buttonNext = makeChild('button', body, 'next', 27, 0, 5, 5);
        buttonSpeaker = makeChild('button', body, 'speaker', 32, 0, 4, 5);
        buttonSpeakers = makeChild('button', body, 'speakAll', 36, 0, 8, 5);
        buttonBrowse = makeChild('button', body, 'browse', 44, 0, 6, 5);
        buttonNextChapter = makeChild('button', body, 'nextChapter', 0, 5, 6, 7);
        pinyinDiv = makeDiv('pinyin', body, 'pinyin', 6, 5, 22, 7, true);
        englishWordDiv = makeDiv('English', body, 'english', 28, 5, 22, 7, true);
        speedBar = makeChildInput('range', body, 'pinyin', 0, 12, 25, 3, true);
        pitchBar = makeChildInput('range', body, 'english', 25, 12, 25, 3, true);
        mainText = makeDiv(null, body, 'mainText', 0, 15, 50, 84, true);
        englishDiv = makeDiv('', body, 'english', 50, 10, 49, 25, true);
        translationDiv = makeDiv('', body, 'translation', 50, 35, 49, 64, false);
        translationDivText = makeDiv('', translationDiv, 'translation', 0, 0, 90, 100, true);
        buttonSpeakPhrase = makeChild('button', translationDiv, 'speakPhrase', 90, 0, 10, 30);
        pictureDiv = makeDiv(null, body, 'pictureDiv', 50, 35, 49, 64, false);
        browseDiv = makeDiv(null, body, 'browserDiv', 50, 50, 49, 49, true);
    }


    styleButton(buttonSpeakPhrase);
    loadImage('stories/speaker', buttonSpeakPhrase);
    buttonSpeakPhrase.addEventListener('click', function () {
        const phrase = translationDiv.getAttribute('data-chinese-phrase');
        if (phrase) speakChinese(phrase, chineseSpeechSpeed, chinesePitch);
    });
    translationDivText.addEventListener('click', function () {
        setDiv2(pictureDiv);
    });
    translationDiv.style.fontSize = '24px';
    pictureDiv.addEventListener('click', function () {
        setDiv2(translationDiv);
    });

    loadImage(storyPath + currentStory + '/' + 'images/0', pictureDiv);

    speedBar.min = .12;
    speedBar.max = 1.8;
    speedBar.value = 1;
    speedBar.step = .01;

    pitchBar.min = .12;
    pitchBar.max = 1.5;
    pitchBar.value = 1;
    pitchBar.step = .01;

    speedBar.addEventListener('input', function () {
        chineseSpeechSpeed = speedBar.value;
    });

    pitchBar.addEventListener('input', function () {
        chinesePitch = pitchBar.value;
    });

    translationDiv.style.position = 'absolute'; // Position needed for z-index to work
    pictureDiv.style.position = 'absolute'; // Position needed for z-index to work
    browseDiv.style.position = 'absolute'; // Position needed for z-index to work

    function setDiv2(d) {
        if (d != browseDiv) {
            browseDiv.style.display = 'none';
        } else {
            browseDiv.style.display = 'block';
        }
        if (d != translationDiv) {
            translationDiv.style.display = 'none';
        } else {
            translationDiv.style.display = 'block';
        }
        if (d != pictureDiv) {
            pictureDiv.style.display = 'none';
        } else {
            pictureDiv.style.display = 'block';
        }
    }

    addBorder(browseDiv, '2px', 'solid', '#A0907E');
    //browseDiv.style.display = 'none'; // Start hidden
    browseDiv.style.position = 'absolute'; // Position needed for z-index to work
    setDiv2(pictureDiv);
    //browseDiv.style.zIndex = '999'; // Set a high z-index to bring it to the front

    buttonBrowse.textContent = '字';
    styleButton(buttonBrowse);

    let charBrowseLines = [];
    // Add event listener to pinyinDiv to toggle browseDiv visibility
    buttonBrowse.addEventListener('click', function () {
        setDiv2(browseDiv);
    });

    function updateBrowse(词) {
        // Create sub-divs for each character and their combinations (up to 3 characters)
        if (currentWordBox) {
            browseDiv.innerHTML = ''; // Clear existing content
            charBrowseLines.length = 0;
            let n = 0;
            const chars = Array.from(词);

            let wordList = searchExactChineseWords(词);
            wordList.forEach((word, index) => {
                let c = new CharBrowseLine(word, browseDiv, n);
                charBrowseLines.push(c);
                n++;
            });

            if (词.length > 3) {
                // Create combinations of 3 characters first
                for (let i = 0; i < chars.length; i++) {
                    if (i + 2 < chars.length) {
                        const combo = chars.slice(i, i + 3).join('');
                        let wordEntry = searchExactChineseWords(combo);
                        if (wordEntry.length > 0) {
                            let c = new CharBrowseLine(wordEntry[0], browseDiv, n);
                            charBrowseLines.push(c);
                        }
                        n++;
                    }
                }
            }
            if (词.length > 2) {
                // Create combinations of 2 characters next
                for (let i = 0; i < chars.length; i++) {
                    if (i + 1 < chars.length) {
                        const combo = chars.slice(i, i + 2).join('');
                        let wordEntry = searchExactChineseWords(combo);
                        if (wordEntry.length > 0) {
                            let c = new CharBrowseLine(wordEntry[0], browseDiv, n);
                            charBrowseLines.push(c);
                        }
                        n++;
                    }
                }
            }

            if (词.length > 1) {
                // Create individual character browse lines last
                chars.forEach((char, index) => {
                    let wordEntry = searchExactChineseWords(char);
                    if (wordEntry.length > 0) {
                        let c = new CharBrowseLine(wordEntry[0], browseDiv, n);
                        charBrowseLines.push(c);
                    }
                    n++;
                });
            }

            wordList = searchChineseWords(词);

            // Create individual character browse lines last
            wordList.forEach((word, index) => {
                let c = new CharBrowseLine(word, browseDiv, n);
                charBrowseLines.push(c);
                n++;
            });
        }
    }






    buttonMenu.textContent = '≡';
    styleButton(buttonMenu);


    buttonMenu.addEventListener('click', async function () {
        // Check if the menu already exists
        let existingMenu = document.getElementById('dropdownMenu');
        if (existingMenu) {
            // Toggle visibility
            if (existingMenu.style.display === 'none' || existingMenu.style.display === '') {
                existingMenu.style.display = 'block';
            } else {
                existingMenu.style.display = 'none';
            }
            return;
        }

        // Create the main menu container
        const menuContainer = document.createElement('div');
        menuContainer.id = 'dropdownMenu';
        applyStyles(menuContainer, {
            position: 'absolute',
            top: `${buttonMenu.offsetTop + buttonMenu.offsetHeight}px`,
            left: `${buttonMenu.offsetLeft}px`,
            border: '1px solid gray',
            backgroundColor: 'white',
            zIndex: '1000',
            minWidth: '200px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'block', // Initially visible
        });

        // Add the "Stories" and "Songs" menu items
        const storiesItem = document.createElement('div');
        storiesItem.textContent = 'Stories ▼';
        applyStyles(storiesItem, {
            padding: '10px',
            cursor: 'pointer',
            backgroundColor: 'lightgray',
            position: 'relative',
        });

        const songsItem = document.createElement('div');
        songsItem.textContent = 'Songs ▼';
        applyStyles(songsItem, {
            padding: '10px',
            cursor: 'pointer',
            backgroundColor: 'lightgray',
        });

        // Hover effects for menu items
        [storiesItem, songsItem].forEach(item => {
            item.addEventListener('mouseover', () => (item.style.backgroundColor = 'lightblue'));
            item.addEventListener('mouseout', () => (item.style.backgroundColor = 'lightgray'));
        });

        function makeSubmenu() {
            // Create submenu for "Stories"
            const m = document.createElement('div');
            applyStyles(m, {
                display: 'none',
                position: 'absolute',
                top: '0px',
                left: '100%',
                border: '1px solid gray',
                backgroundColor: 'white',
                minWidth: '200px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            });
            return m;
        }
        const storiesSubmenu = makeSubmenu();

        // Fetch story folders
        let storyList = [];
        try {
            storyList = await folderList('stories');
        } catch (error) {
            console.error('Error fetching story folders:', error);
        }

        // Populate storiesSubmenu with folders
        storyList.forEach(folder => {
            const folderItem = document.createElement('div');
            folderItem.textContent = folder;
            applyStyles(folderItem, {
                padding: '5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            });

            folderItem.addEventListener('mouseover', () => (folderItem.style.backgroundColor = 'lightblue'));
            folderItem.addEventListener('mouseout', () => (folderItem.style.backgroundColor = 'white'));

            folderItem.addEventListener('click', async () => {
                console.log(`Selected folder: ${folder}`);
                currentPictureNumber = 0;
                updatePhrasesForChapter(storyPath + folder);
                loadTextFileToArray(storyPath + folder + '/' + folder + '.txt', chineseParagraphs, true).then(() => {
                    createMainDivs(chineseParagraphs);
                });
                currentStory = folder;
                resetIllustration();
                storiesSubmenu.style.display = 'none';
                menuContainer.style.display = 'none';

                // check for a video
                songURL = await getUrlFromPath(storyPath + folder + '/');
            });

            storiesSubmenu.appendChild(folderItem);
        });

        const songsSubmenu = makeSubmenu();

        // Fetch story folders
        let songList = [];
        try {
            songList = await folderList('songs');
        } catch (error) {
            console.error('Error fetching story folders:', error);
        }

        // Populate songsSubmenu with folders
        songList.forEach(folder => {
            const folderItem = document.createElement('div');
            folderItem.textContent = folder;
            applyStyles(folderItem, {
                padding: '5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            });

            folderItem.addEventListener('mouseover', () => (folderItem.style.backgroundColor = 'lightblue'));
            folderItem.addEventListener('mouseout', () => (folderItem.style.backgroundColor = 'white'));

            folderItem.addEventListener('click', async () => {
                storyPath = 'songs/';
                console.log(`Selected folder: ${folder}`);
                currentPictureNumber = 0;
                updatePhrasesForChapter(songPath + folder);
                loadTextFileToArray(songPath + folder + '/' + folder + '.txt', chineseParagraphs, true).then(() => {
                    createMainDivs(chineseParagraphs);
                });
                currentStory = folder;
                resetIllustration();
                songsSubmenu.style.display = 'none';
                menuContainer.style.display = 'none';

                // check for a video
                songURL = await getUrlFromPath(songPath + folder + '/');
            });

            songsSubmenu.appendChild(folderItem);
        });

        storiesItem.addEventListener('mouseenter', () => (storiesSubmenu.style.display = 'block'));
        storiesItem.addEventListener('mouseleave', () => (storiesSubmenu.style.display = 'none'));

        songsItem.addEventListener('mouseenter', () => (songsSubmenu.style.display = 'block'));
        songsItem.addEventListener('mouseleave', () => (songsSubmenu.style.display = 'none'));

        storiesItem.appendChild(storiesSubmenu);
        songsItem.appendChild(songsSubmenu);
        menuContainer.appendChild(storiesItem);
        menuContainer.appendChild(songsItem);
        document.body.appendChild(menuContainer);

        // Close the menu when clicking outside
        document.addEventListener('click', function handleClickOutside(event) {
            if (!menuContainer.contains(event.target) && event.target !== buttonMenu) {
                menuContainer.style.display = 'none';
                document.removeEventListener('click', handleClickOutside); // Cleanup the event listener
            }
        });
    });


    styleButton(buttonNextChapter);
    loadImage('stories/nextChapter', buttonNextChapter);
    buttonNextChapter.addEventListener('click', async function () {
        chapterNumber = (parseInt(chapterNumber) + 1).toString();
        currentStory = defaultStory + chapterNumber;
        await loadChapter(currentStory);
        resetIllustration();
        createMainDivs(chineseParagraphs);
    });

    function checkForLowerLevel(language) {
        let versions = language === 'English' ? englishVersions : 中文Versions;
        let currentLevel = parseInt(readingLevel, 10);
        let lowerLevel = currentLevel - 1;
        let lowerLevelFile = versions.find(file => file.startsWith(lowerLevel.toString()));
        return lowerLevelFile ? lowerLevelFile : null;
    }

    function checkForHigherLevel(language) {
        let versions = language === 'English' ? englishVersions : 中文Versions;
        let currentLevel = parseInt(readingLevel, 10);
        let lowerLevel = currentLevel + 1;
        let lowerLevelFile = versions.find(file => file.startsWith(lowerLevel.toString()));
        return lowerLevelFile ? lowerLevelFile : null;
    }

    buttonPlay.textContent = '▶';
    styleButton(buttonPlay);
    buttonPlay.addEventListener('click', async function () {
        if (songURL != null) {
            prepareYouTubeContainer(pictureDiv);
            embedYouTubeAtBottom(pictureDiv, songURL);
        }
    });

    /*
    buttonEasier.addEventListener('click', async function () {
        let fn = checkForLowerLevel('中文');
        if (fn != null) {
            readingLevel = fn.substring(0, 1);
            fitTextInElement(buttonLevel, readingLevel);
            loadTextFileToArray(storyPath + currentStory + '/' + fn, chineseParagraphs, true).then(() => {
                createMainDivs(chineseParagraphs);
            });
        }
    });
    */

    buttonLevel.textContent = readingLevel;
    styleButton(buttonLevel);

    buttonHarder.textContent = '↑';
    styleButton(buttonHarder);
    buttonHarder.addEventListener('click', async function () {
        let fn = checkForHigherLevel('中文');
        if (fn != null) {
            readingLevel = fn.substring(0, 1);
            fitTextInElement(buttonLevel, readingLevel);
            loadTextFileToArray(storyPath + currentStory + '/' + fn, chineseParagraphs, true).then(() => {
                createMainDivs(chineseParagraphs);
            });
        }
    });

    buttonClipboard.textContent = '📋';
    styleButton(buttonClipboard);
    buttonClipboard.addEventListener('click', async function () {
        loadClipboardTextToArray(chineseParagraphs).then(() => {
            createMainDivs(chineseParagraphs);
        });
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
                document.documentElement.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
        if (!isTouchDevice2()) {
            document.getElementById('answer').focus();
        }
    }

    buttonFullScreen.textContent = '⤢';
    styleButton(buttonFullScreen);
    buttonFullScreen.addEventListener('click', async function () {
        toggleFullscreen();
    });

    buttonPrevious.textContent = '←';
    styleButton(buttonPrevious);
    buttonPrevious.addEventListener('click', async function () {
        shiftHighlight(true);
    });
    buttonNext.textContent = '→';
    styleButton(buttonNext);
    buttonNext.addEventListener('click', async function () {
        shiftHighlight(false);
    });

    styleButton(buttonSpeaker);
    loadImage('songs/speaker', buttonSpeaker);
    //loadImage('stories/speaker', buttonSpeaker);
    buttonSpeaker.addEventListener('click', async function () {
        paragraphs[currentParagraphNumber].speak();
    });
    styleButton(buttonSpeakers);
    loadImage('stories/speaker2', buttonSpeakers);
    buttonSpeakers.addEventListener('click', async function () {
        let chunks = prepareChunks(currentWordBox.word);
        currentWordBox.speak();
    });

    addBorder(pinyinDiv, '2px', 'solid', '#90B0EE');
    addBorder(englishWordDiv, '2px', 'solid', '#90B0EE');
    addBorder(mainText, '2px', 'solid', 'green');
    addBorder(translationDiv, '2px', 'solid', '#90EE90');
    addBorder(pictureDiv, '2px', 'solid', '#9090EE');
    if (englishDiv != null) {
        addBorder(englishDiv, '2px', 'solid', '#90B0CE');
    }

    let paragraphs = [];

    let currentWordBox = null; // this should be a span object
    let oldWordBox = null;


    let currentWordBoxIndex = 0;

    let wordBoxes = [];



    function selectWord(wb) {
        currentWordBox = wb;
        if (oldWordBox) oldWordBox.setHighlighted(false);
        wb.setHighlighted(true);
        oldWordBox = wb;
        currentWordBoxIndex = wb.index;

        pinyinDiv.textContent = wordToPinyin(wb.word);
        textFit(pinyinDiv, { multiLine: false });
        englishWordDiv.textContent = wordToEnglish(wb.word);
        setParagraph(wb.paragraphIndex);
        updateBrowse(wb.word);
        if (englishDiv) {
            englishDiv.innerHTML = englishVersion[currentParagraphNumber] ?? '';
            englishDiv.setAttribute('data-chinese-phrase', englishVersion[currentParagraphNumber] ?? '');
        }
        // same tap-to-preview you had before
        speakChinese(wb.word, 1, 1);
    }

    class Paragraph {
        constructor(text, parentDiv, paragraphIndex) {
            this.text = text;
            this.words = [];
            this.wordIndexes = []; // Array to hold the index of each word in the original text
            this.phrases = []; // This array holds one element per character of the paragraph and references which phrase that character is part of
            this.paragraphIndex = paragraphIndex;

            // Create a new div element for each paragraph
            this.paragraphDiv = document.createElement('div');
            this.paragraphDiv.style.fontSize = '38px';

            // Assign an ID to the div
            this.paragraphDiv.id = 'paragraph' + paragraphIndex;

            // Style the div (optional border, margin, and padding)
            this.paragraphDiv.style.border = '1px solid #333';
            this.paragraphDiv.style.margin = '5px 0';
            this.paragraphDiv.style.padding = '5px';
            parentDiv.appendChild(this.paragraphDiv);

            this.toWords();

            // Loop through wordIndexes to detect phrases
            let i = 0;
            while (i < this.text.length) {
                let detectedPhrase = this.getDetectedPhraseAtIndex(i);
                if (detectedPhrase) {
                    const phraseLength = detectedPhrase.length;

                    // Assign the detected phrase to all characters it spans
                    for (let j = 0; j < phraseLength; j++) {
                        this.phrases[i + j] = detectedPhrase;
                    }

                    // Skip past the characters in the detected phrase
                    i += phraseLength;
                } else {
                    i++;
                }
            }

            // wordsRow is your container for word elements
            // words is your array of Chinese words
            // wordBoxes is global or outer-scope so deps.getWordBox can see it

 

            // Build WordBox instances for THIS paragraph using the module class
            const startIndex = wordBoxes.length;

            const deps = {
                prepareChunks,
                speakChunks,
                stopSpeaking,
                getSpeed: () => chineseSpeechSpeed,
                getPitch: () => chinesePitch,
                getWordBox: (i) => wordBoxes[i],
                onSelectWord: (wb) => selectWord(wb),
                onCharClick: ({ wb, charIndex }) => {
                    // map from word-local char index to paragraph char index → phrase lookup
                    const paraWordIndex = wb.index - startIndex;             // index within this paragraph
                    const absChar = this.wordIndexes[paraWordIndex] + charIndex;
                    const phrase = this.phrases[absChar] || null;
                    if (phrase) {
                        translationDivText.innerHTML = chinesePhrases.get(phrase);
                        if (translationDiv.getAttribute('data-chinese-phrase') !== phrase) {
                            translationDiv.setAttribute('data-chinese-phrase', phrase);
                            translationDivText.scrollTop = 0;
                        }
                        setDiv2(translationDiv);
                    } else {
                        setDiv2(pictureDiv);
                    }
                }
            };

            this.words.forEach((w, i) => {
                const wb = new WordBox({
                    word: w,
                    parentEl: this.paragraphDiv,
                    index: startIndex + i,
                    paragraphIndex: this.paragraphIndex,
                    deps
                });
                wordBoxes.push(wb);
            });


        }
        speak() {
            speakChinese(this.text, chineseSpeechSpeed, chinesePitch);
        }
        toWords() {
            let i = 0;
            let currentIndex = 0;

            while (i < this.text.length) {
                let matchFound = false;
                let index = i;

                // Try to match the longest possible word starting from the current character
                for (let j = Math.min(this.text.length, i + 5); j > i; j--) {
                    let substring = this.text.slice(i, j);

                    // Check if the substring matches any entry in chineseWords
                    if (chineseWords.has(substring)) {
                        this.words.push(substring);  // Add the matched word
                        i = j;  // Move the index forward by the length of the matched word
                        matchFound = true;
                        break;
                    }
                }

                // If no match is found, add the single character and move forward
                if (!matchFound) {
                    this.words.push(this.text[i]);
                    i++;
                }
                this.wordIndexes.push(index);
                currentIndex += this.words.at(-1).length;
                this.phrases.push(null);
            }
        }
        getDetectedPhraseAtIndex(index) {
            let detectedPhrase = null;
            // Check for phrases starting at the given index up to a maximum of 20 characters
            for (let length = 20; length >= 1; length--) {
                if (index + length <= this.text.length) {
                    const phraseAttempt = this.text.slice(index, index + length);
                    if (chinesePhrases.has(phraseAttempt)) {
                        detectedPhrase = phraseAttempt;
                        break; // Stop at the first match
                    }
                }
            }
            return detectedPhrase;
        }
    }

    class CharBrowseLine {
        constructor(wordEntry, parentDiv, index) {
            this.wordEntry = wordEntry;
            this.div = document.createElement('div');
            this.div.id = 'charBrowsLine' + index;
            // Style the div (optional border, margin, and padding)
            this.div.style.border = '1px solid #333';
            this.div.style.margin = '5px 0';
            this.div.style.padding = '5px';
            this.div.textContent = wordEntry[0] + ' ' + wordEntry[1] + ': ' + wordEntry[2];
            parentDiv.appendChild(this.div);
            this.div.addEventListener('mousedown', (event) => {
                if (event.button === 0) {
                    // Left button click
                    updateBrowse(wordEntry[0]);
                }
            });
            this.div.addEventListener('contextmenu', (event) => {
                event.preventDefault(); // Disable the right-click context menu
                speakChinese(wordEntry[0], chineseSpeechSpeed, chinesePitch);
            });
        }
    }

    function setParagraph(index) {
        if (currentParagraphNumber != index) {
            currentParagraphNumber = index;

            if (currentPictureNumber != pictureNumber[currentParagraphNumber]) {
                loadImage(storyPath + currentStory + '/' + 'images/' + pictureNumber[currentParagraphNumber].toString(), pictureDiv);
                currentPictureNumber = pictureNumber[currentParagraphNumber];
            }

            // Update translations based on the paragraph index
            if (typeof translationDivText !== 'undefined') {
                translationDivText.textContent = englishVersion[index];
            }
        }
    }

    function createMainDivs(textArray) {
        // Clear existing content in mainText (optional)
        mainText.innerHTML = '';
        paragraphs = [];

        // Iterate through each paragraph in the 2D array
        for (let i = 0; i < textArray.length; i++) {
            let p = new Paragraph(textArray[i], mainText, i);
            paragraphs.push(p);
        }
    }
    createMainDivs(chineseParagraphs);

    function shiftHighlight(isLeft) {
        if (isLeft) {
            if (currentWordBoxIndex <= 0) {
                return;
            }
            currentWordBoxIndex--;
        } else {
            if (currentWordBoxIndex >= wordBoxes.length - 1) {
                return;
            }
            currentWordBoxIndex++;
        }
        currentWordBox = wordBoxes[currentWordBoxIndex];
        currentWordBox.highlight(true);

        if (oldWordBox != null) {
            oldWordBox.highlight(false);
        }
        oldWordBox = currentWordBox;
        let punctuationRegex = /[。“”？！￥%@…，、：；——（）《》【】‘’“”·]/;

        // Check if the word is a punctuation mark
        if (punctuationRegex.test(currentWordBox.word)) {
            // Handle the case where the word is a punctuation mark
            shiftHighlight(isLeft);
        }
    }


    document.addEventListener('keydown', function (event) {
        let canvas;
        switch (event.key) {
            case 'ArrowLeft':
                shiftHighlight(true);
                break;
            case 'ArrowRight':
                shiftHighlight(false);
                break;
            case 'Enter':
                let chunks = prepareChunks(currentWordBox.word);
                currentWordBox.speak(chunks);
                break;
        }
    });



}
