// Theme management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
let currentTheme = 'dark';

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'dark') {
        themeIcon.className = 'fas fa-moon';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    } else {
        themeIcon.className = 'fas fa-sun';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
});

// Dictionary Search
const searchBtn = document.getElementById('searchBtn');
const searchWord = document.getElementById('searchWord');
const searchResults = document.getElementById('searchResults');

searchBtn.addEventListener('click', performSearch);
searchWord.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

async function performSearch() {
    const word = searchWord.value.trim();
    if (!word) {
        showError('Please enter a word to search', 'searchResults');
        return;
    }

    showLoading('searchResults');

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: word })
        });

        const data = await response.json();

        if (response.ok) {
            displaySearchResults(data);
        } else {
            showError(data.error || 'Word not found', 'searchResults');
        }
    } catch (error) {
        showError('Network error occurred', 'searchResults');
    }
}

function displaySearchResults(data) {
    let html = '';
    
    data.forEach(entry => {
        html += `<div class="word-result">`;
        html += `<div class="word-title">${entry.word}</div>`;
        
        if (entry.phonetics && entry.phonetics.length > 0) {
            const phonetic = entry.phonetics.find(p => p.text) || entry.phonetics[0];
            if (phonetic.text) {
                html += `<div class="phonetic">${phonetic.text}</div>`;
            }
        }

        entry.meanings.forEach(meaning => {
            html += `<div class="meaning">`;
            html += `<div class="part-of-speech">${meaning.partOfSpeech}</div>`;
            
            meaning.definitions.forEach((def, index) => {
                html += `<div class="definition">${index + 1}. ${def.definition}</div>`;
                if (def.example) {
                    html += `<div class="example">Example: "${def.example}"</div>`;
                }
            });
            html += `</div>`;
        });
        
        html += `</div>`;
    });

    searchResults.innerHTML = html;
}

// Translation
const translateBtn = document.getElementById('translateBtn');
const translateWord = document.getElementById('translateWord');
const languageSelect = document.getElementById('languageSelect');
const translationResults = document.getElementById('translationResults');

translateBtn.addEventListener('click', performTranslation);
translateWord.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performTranslation();
    }
});

async function performTranslation() {
    const word = translateWord.value.trim();
    const targetLang = languageSelect.value;
    
    if (!word) {
        showError('Please enter a word to translate', 'translationResults');
        return;
    }

    showLoading('translationResults');

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                word: word, 
                target_lang: targetLang 
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayTranslationResults(data);
        } else {
            showError(data.error || 'Translation failed', 'translationResults');
        }
    } catch (error) {
        showError('Network error occurred', 'translationResults');
    }
}

function displayTranslationResults(data) {
    const languageNames = {
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi'
    };

    const html = `
        <div class="translation-result">
            <div class="original-word">English: ${data.original}</div>
            <div class="translated-word">${languageNames[data.target_language]}: ${data.translated}</div>
        </div>
    `;
    
    translationResults.innerHTML = html;
}

// Utility functions
function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = '<div class="loading">Loading...</div>';
}

function showError(message, elementId) {
    document.getElementById(elementId).innerHTML = `<div class="error">${message}</div>`;
}

function displayTranslationResults(data) {
    const html = `
        <div class="translation-result">
            <div class="original-word">English: ${data.original}</div>
            <div class="translated-word">${data.target_language_name || 'Translation'}: ${data.translated}</div>
        </div>
    `;
    
    translationResults.innerHTML = html;
}
