/**
 * Multilanguage support for YAP2U website
 * Supports: English, Portuguese (Brazilian), Spanish, Italian, French, German
 */

// Language configuration
const LANGUAGES = {
  en: {
    name: 'English',
    code: 'en',
    flag: '🇺🇸'
  },
  'pt-br': {
    name: 'Português (Brasil)',
    code: 'pt-br',
    flag: '🇧🇷'
  },
  es: {
    name: 'Español',
    code: 'es',
    flag: '🇪🇸'
  },
  it: {
    name: 'Italiano',
    code: 'it',
    flag: '🇮🇹'
  },
  fr: {
    name: 'Français',
    code: 'fr',
    flag: '🇫🇷'
  },
  de: {
    name: 'Deutsch',
    code: 'de',
    flag: '🇩🇪'
  }
};

// Default language
let currentLanguage = 'en';

// Initialize translations object
let translations = {};

/**
 * Load translations for the specified language
 * @param {string} lang - Language code
 * @returns {Promise} - Promise that resolves when translations are loaded
 */
function loadTranslations(lang) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `lib/i18n/${lang}.json`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            translations = data;
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse translations'));
          }
        } else {
          reject(new Error('Failed to load translations'));
        }
      }
    };
    xhr.send();
  });
}

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} - Translated text or the key if translation not found
 */
function t(key) {
  return translations[key] || key;
}

/**
 * Apply translations to the page
 */
function applyTranslations() {
  // Update HTML lang attribute
  document.documentElement.setAttribute('lang', currentLanguage);
  
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
  
  // Update all elements with data-i18n-placeholder attribute
  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      element.setAttribute('placeholder', translations[key]);
    }
  });
  
  // Update all elements with data-i18n-title attribute
  const titles = document.querySelectorAll('[data-i18n-title]');
  titles.forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    if (translations[key]) {
      element.setAttribute('title', translations[key]);
    }
  });
  
  // Update all elements with data-i18n-alt attribute
  const alts = document.querySelectorAll('[data-i18n-alt]');
  alts.forEach(element => {
    const key = element.getAttribute('data-i18n-alt');
    if (translations[key]) {
      element.setAttribute('alt', translations[key]);
    }
  });
  
  // Update all elements with data-i18n-html attribute (for HTML content)
  const htmlElements = document.querySelectorAll('[data-i18n-html]');
  htmlElements.forEach(element => {
    const key = element.getAttribute('data-i18n-html');
    if (translations[key]) {
      element.innerHTML = translations[key];
    }
  });
}

/**
 * Change the current language
 * @param {string} lang - Language code
 * @returns {Promise} - Promise that resolves when language is changed
 */
function changeLanguage(lang) {
  if (!LANGUAGES[lang]) {
    console.error(`Language ${lang} is not supported`);
    return Promise.reject(new Error(`Language ${lang} is not supported`));
  }
  
  currentLanguage = lang;
  
  // Save language preference to localStorage
  localStorage.setItem('yap2u_language', lang);
  
  // Update language switcher UI
  updateLanguageSwitcher();
  
  // Load and apply translations
  return loadTranslations(lang)
    .then(() => {
      applyTranslations();
      // Trigger a custom event that other scripts can listen for
      const event = new CustomEvent('languageChanged', { detail: { language: lang } });
      document.dispatchEvent(event);
      return lang;
    })
    .catch(error => {
      console.error('Failed to change language:', error);
      return Promise.reject(error);
    });
}

/**
 * Update the language switcher UI
 */
function updateLanguageSwitcher() {
  const switcher = document.getElementById('language-switcher');
  if (!switcher) return;
  
  const currentBtn = switcher.querySelector('.current-language');
  if (currentBtn) {
    currentBtn.textContent = `${LANGUAGES[currentLanguage].flag} ${LANGUAGES[currentLanguage].name}`;
  }
}

/**
 * Create language switcher UI
 * @returns {HTMLElement} - Language switcher element
 */
function createLanguageSwitcher() {
  // Create container
  const container = document.createElement('div');
  container.id = 'language-switcher-container';
  container.className = 'language-switcher-container';
  
  // Create switcher
  const switcher = document.createElement('div');
  switcher.id = 'language-switcher';
  switcher.className = 'language-switcher';
  
  // Create current language button
  const currentBtn = document.createElement('button');
  currentBtn.className = 'current-language';
  currentBtn.textContent = `${LANGUAGES[currentLanguage].flag} ${LANGUAGES[currentLanguage].name}`;
  
  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'language-dropdown';
  
  // Add language options
  Object.values(LANGUAGES).forEach(lang => {
    const option = document.createElement('a');
    option.href = '#';
    option.className = 'language-option';
    option.dataset.lang = lang.code;
    option.textContent = `${lang.flag} ${lang.name}`;
    option.addEventListener('click', (e) => {
      e.preventDefault();
      changeLanguage(lang.code);
      dropdown.classList.remove('show');
    });
    dropdown.appendChild(option);
  });
  
  // Toggle dropdown on click
  currentBtn.addEventListener('click', () => {
    dropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  
  // Assemble switcher
  switcher.appendChild(currentBtn);
  switcher.appendChild(dropdown);
  container.appendChild(switcher);
  
  return container;
}

/**
 * Initialize the language system
 */
function initLanguage() {
  // Create and add language switcher to the page
  const switcher = createLanguageSwitcher();
  document.body.appendChild(switcher);
  
  // Add CSS for language switcher
  const style = document.createElement('style');
  style.textContent = `
    .language-switcher-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    }
    
    .language-switcher {
      position: relative;
      display: inline-block;
    }
    
    .current-language {
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .language-dropdown {
      display: none;
      position: absolute;
      right: 0;
      top: 100%;
      background-color: #fff;
      min-width: 160px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      z-index: 1;
      border-radius: 4px;
      margin-top: 5px;
    }
    
    .language-dropdown.show {
      display: block;
    }
    
    .language-option {
      color: #333;
      padding: 12px 16px;
      text-decoration: none;
      display: block;
      font-size: 14px;
      border-bottom: 1px solid #eee;
    }
    
    .language-option:last-child {
      border-bottom: none;
    }
    
    .language-option:hover {
      background-color: #f9f9f9;
    }
  `;
  document.head.appendChild(style);
  
  // Check for saved language preference
  const savedLang = localStorage.getItem('yap2u_language');
  if (savedLang && LANGUAGES[savedLang]) {
    currentLanguage = savedLang;
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.toLowerCase().split('-')[0];
    const fullBrowserLang = navigator.language.toLowerCase();
    
    // Special case for Brazilian Portuguese
    if (fullBrowserLang === 'pt-br' && LANGUAGES['pt-br']) {
      currentLanguage = 'pt-br';
    } 
    // For other languages, just check the main language code
    else if (LANGUAGES[browserLang]) {
      currentLanguage = browserLang;
    }
  }
  
  // Load initial translations
  loadTranslations(currentLanguage)
    .then(() => {
      applyTranslations();
      updateLanguageSwitcher();
    })
    .catch(error => {
      console.error('Failed to load initial translations:', error);
      // Fallback to English if loading fails
      if (currentLanguage !== 'en') {
        currentLanguage = 'en';
        loadTranslations('en')
          .then(() => {
            applyTranslations();
            updateLanguageSwitcher();
          });
      }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLanguage);

// Export functions for global use
window.i18n = {
  t,
  changeLanguage,
  getCurrentLanguage: () => currentLanguage,
  getSupportedLanguages: () => Object.keys(LANGUAGES)
};

