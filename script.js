/**
 * سامانه مدرسه‌یاب ناحیه ۵ مشهد
 * School Finder Application - JavaScript
 * 
 * This application helps find schools based on grade, gender, street name and house number
 */

// ============================================
// Global Variables
// ============================================

let schoolsData = [];
let uniqueStreets = [];

// ============================================
// Initialization
// ============================================

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSchoolsData();
    setupEventListeners();
    extractUniqueStreets();
    setupAutocomplete();
  } catch (error) {
    console.error('خطا در بارگذاری برنامه:', error);
    showError('خطا در بارگذاری برنامه. لطفاً صفحه را دوباره بارگذاری کنید.');
  }
});

/**
 * Load schools data from schools.json
 */
async function loadSchoolsData() {
  try {
    const response = await fetch('schools.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    schoolsData = await response.json();
  } catch (error) {
    console.error('خطا در بارگذاری فایل schools.json:', error);
    throw error;
  }
}

/**
 * Setup event listeners for form elements
 */
function setupEventListeners() {
  const gradeSelect = document.getElementById('grade');
  const genderSelect = document.getElementById('gender');
  const streetInput = document.getElementById('street');
  const numberInput = document.getElementById('number');
  const searchButton = document.querySelector('button');

  // Allow Enter key to trigger search
  streetInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchSchool();
    }
  });

  numberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchSchool();
    }
  });

  // Search button click
  searchButton.addEventListener('click', searchSchool);
}

// ============================================
// Autocomplete Functionality
// ============================================

/**
 * Extract unique street names from schools data
 */
function extractUniqueStreets() {
  const streetsSet = new Set();
  
  schoolsData.forEach(school => {
    if (school.streets && Array.isArray(school.streets)) {
      school.streets.forEach(street => {
        streetsSet.add(street.trim());
      });
    }
  });

  uniqueStreets = Array.from(streetsSet).sort();
}

/**
 * Setup autocomplete functionality for street input
 */
function setupAutocomplete() {
  const streetInput = document.getElementById('street');
  const autocompleteList = document.getElementById('autocompleteList');

  streetInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    updateAutocompleteList(value, autocompleteList, streetInput);
  });

  streetInput.addEventListener('focus', (e) => {
    if (e.target.value.trim()) {
      updateAutocompleteList(e.target.value.trim(), autocompleteList, streetInput);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target !== streetInput && e.target !== autocompleteList) {
      autocompleteList.classList.remove('active');
    }
  });
}

/**
 * Update autocomplete list based on input
 * @param {string} value - Input value
 * @param {HTMLElement} listElement - The list container element
 * @param {HTMLElement} inputElement - The input element
 */
function updateAutocompleteList(value, listElement, inputElement) {
  if (!value) {
    listElement.classList.remove('active');
    return;
  }

  // Filter streets matching the input
  const matches = uniqueStreets.filter(street =>
    street.includes(value)
  ).slice(0, 10); // Limit to 10 results

  if (matches.length === 0) {
    listElement.classList.remove('active');
    return;
  }

  // Clear and populate the list
  listElement.innerHTML = '';
  matches.forEach((street, index) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = street;
    item.addEventListener('click', () => {
      inputElement.value = street;
      listElement.classList.remove('active');
    });
    listElement.appendChild(item);
  });

  listElement.classList.add('active');
}

// ============================================
// Search Functionality
// ============================================

/**
 * Main search function
 */
function searchSchool() {
  const grade = document.getElementById('grade').value;
  const gender = document.getElementById('gender').value;
  const street = document.getElementById('street').value.trim();
  const number = document.getElementById('number').value.trim();

  // Validation
  if (!street) {
    showError('لطفاً نام کوچه را وارد کنید.');
    return;
  }

  if (!number) {
    showError('لطفاً شماره پلاک را وارد کنید.');
    return;
  }

  // Search for matching schools
  const results = findMatchingSchools(grade, gender, street, number);

  // Display results
  displayResults(results, grade, gender, street, number);
}

/**
 * Find schools that match the search criteria
 * @param {string} grade - Selected grade
 * @param {string} gender - Selected gender
 * @param {string} street - Street name
 * @param {string} number - House number
 * @returns {Array} Array of matching schools
 */
function findMatchingSchools(grade, gender, street, number) {
  return schoolsData.filter(school => {
    // Check gender match
    const genderMatches = school.gender === gender + 'انه' || 
                         school.gender === gender;

    // Check if school serves this grade
    const levelText = school.level || '';
    let gradeMatches = false;

    if (levelText.includes(grade) || levelText.includes(getGradeArabic(grade))) {
      gradeMatches = true;
    }

    // Check if street and number are in the school's service area
    const fullAddress = street + ' ' + number;
    const streets = school.streets || [];
    
    const streetMatches = streets.some(s => {
      const normalized_s = normalizeStreet(s);
      const normalized_input = normalizeStreet(fullAddress);
      return normalized_input.includes(normalized_s) || 
             normalized_s.includes(normalized_input);
    });

    return genderMatches && gradeMatches && streetMatches;
  });
}

/**
 * Get Arabic numeral for Persian grade name
 * @param {string} grade - Grade name in Persian
 * @returns {string} Arabic numeral equivalent
 */
function getGradeArabic(grade) {
  const gradeMap = {
    'اول': '1',
    'دوم': '2',
    'سوم': '3',
    'چهارم': '4',
    'پنجم': '5',
    'ششم': '6'
  };
  return gradeMap[grade] || '';
}

/**
 * Normalize street name for comparison
 * @param {string} street - Street name to normalize
 * @returns {string} Normalized street name
 */
function normalizeStreet(street) {
  return street
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\/\d+/g, '') // Remove fractional numbers like /1, /2
    .toLowerCase();
}

// ============================================
// Display Results
// ============================================

/**
 * Display search results
 * @param {Array} results - Array of matching schools
 * @param {string} grade - Selected grade
 * @param {string} gender - Selected gender
 * @param {string} street - Street name
 * @param {string} number - House number
 */
function displayResults(results, grade, gender, street, number) {
  const resultDiv = document.getElementById('result');
  const resultContainer = document.getElementById('resultContainer');

  if (results.length === 0) {
    resultContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h2>مدرسه‌ای یافت نشد</h2>
        <p>متأسفانه مدرسه‌ای برای آدرس <strong>${street} ${number}</strong> در پایه <strong>${grade}</strong> برای <strong>${gender}</strong> پیدا نشد.</p>
        <p style="margin-top: 15px; color: #999; font-size: 14px;">لطفاً اطلاعات را دوباره بررسی کنید یا با اداره آموزش و پرورش تماس بگیرید.</p>
      </div>
    `;
  } else {
    let cardsHTML = '<div class="cards-grid">';
    
    results.forEach(school => {
      cardsHTML += createSchoolCard(school);
    });
    
    cardsHTML += '</div>';
    resultContainer.innerHTML = cardsHTML;
  }

  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Create HTML card for a school
 * @param {Object} school - School data object
 * @returns {string} HTML string for the card
 */
function createSchoolCard(school) {
  const phone = formatPhone(school.phone);
  const adjacentSchools = formatAdjacentSchools(school.adjacent);
  
  return `
    <div class="card">
      <h2>${school.name}</h2>
      <div class="card-info">
        <div class="card-item">
          <span class="badge badge-gender">👧 ${school.gender}</span>
        </div>
        <div class="card-item">
          <span class="card-label">شیفت:</span>
          <span class="card-value">${school.shift}</span>
        </div>
        <div class="card-item">
          <span class="card-label">پایه تحصیلی:</span>
          <span class="card-value">${school.level}</span>
        </div>
        <div class="card-item">
          <span class="card-label">تلفن:</span>
          <span class="card-value">${phone}</span>
        </div>
        <div class="card-item">
          <span class="card-label">آدرس:</span>
          <span class="card-value">${school.address}</span>
        </div>
        ${adjacentSchools ? `
        <div class="card-item">
          <span class="card-label">مدارس مجاور:</span>
          <div class="card-value">${adjacentSchools}</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Format phone number for display
 * @param {string|number} phone - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhone(phone) {
  if (!phone) return 'در دسترس نیست';
  
  const phoneStr = phone.toString().trim();
  
  // Handle multiple phone numbers separated by newlines or spaces
  if (phoneStr.includes('\n')) {
    return phoneStr.split('\n').join(' - ');
  }
  
  return phoneStr;
}

/**
 * Format adjacent schools for display
 * @param {string} adjacent - Adjacent schools string
 * @returns {string} Formatted HTML for adjacent schools
 */
function formatAdjacentSchools(adjacent) {
  if (!adjacent || !adjacent.trim()) return '';
  
  const schools = adjacent
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (schools.length === 0) return '';
  
  return schools
    .map(school => `<span class="badge">${school}</span>`)
    .join('');
}

// ============================================
// Error Handling
// ============================================

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const resultDiv = document.getElementById('result');
  const resultContainer = document.getElementById('resultContainer');

  resultContainer.innerHTML = `
    <div class="no-results" style="color: #c33;">
      <div class="no-results-icon">⚠️</div>
      <h2>خطا</h2>
      <p>${message}</p>
    </div>
  `;

  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
