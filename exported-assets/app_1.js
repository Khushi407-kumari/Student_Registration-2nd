// Application Data
const appData = {
    courses: ["Computer Science", "Information Technology", "Software Engineering", "Data Science", "Cybersecurity", "Web Development", "Mobile App Development", "AI/Machine Learning"],
    academicYears: ["First Year", "Second Year", "Third Year", "Fourth Year", "Graduate"],
    genders: ["Male", "Female", "Other", "Prefer not to say"],
    educationLevels: ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctorate"]
};

// DOM Elements
const elements = {
    form: null,
    progressFill: null,
    progressPercentage: null,
    submitBtn: null,
    resetBtn: null,
    toast: null,
    toastMessage: null,
    registrationSection: null,
    confirmationSection: null,
    registrationId: null,
    registrationDate: null,
    summaryContent: null,
    printBtn: null,
    newRegistrationBtn: null,
    editRegistrationBtn: null,
    addressCounter: null
};

// Validation Rules
const validationRules = {
    required: (value) => value && value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value),
    name: (value) => /^[a-zA-Z\s'-]+$/.test(value) && value.trim().length >= 2,
    age: (value) => {
        if (!value) return false;
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 16 && age <= 100;
    },
    file: (input) => {
        if (!input.files || input.files.length === 0) return true; // Optional field
        const file = input.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize && file.type.startsWith('image/');
    }
};

// Error Messages
const errorMessages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number (e.g., (123) 456-7890)',
    name: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)',
    age: 'Please enter a valid birth date (age must be between 16 and 100)',
    file: 'Please select a valid image file (max 5MB)'
};

// Application State
let formData = {};
let validationState = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeApp();
});

function initializeElements() {
    elements.form = document.getElementById('registration-form');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressPercentage = document.getElementById('progress-percentage');
    elements.submitBtn = document.getElementById('submit-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toast-message');
    elements.registrationSection = document.getElementById('registration-section');
    elements.confirmationSection = document.getElementById('confirmation-section');
    elements.registrationId = document.getElementById('registration-id');
    elements.registrationDate = document.getElementById('registration-date');
    elements.summaryContent = document.getElementById('summary-content');
    elements.printBtn = document.getElementById('print-btn');
    elements.newRegistrationBtn = document.getElementById('new-registration-btn');
    elements.editRegistrationBtn = document.getElementById('edit-registration-btn');
    elements.addressCounter = document.getElementById('address-counter');
}

function initializeApp() {
    populateDropdowns();
    setupEventListeners();
    loadSavedData();
    updateProgress();
}

// Populate Dropdown Options
function populateDropdowns() {
    const genderSelect = document.getElementById('gender');
    const academicYearSelect = document.getElementById('academicYear');
    const courseSelect = document.getElementById('course');
    const educationSelect = document.getElementById('previousEducation');

    // Clear existing options first (except placeholder)
    if (genderSelect) {
        appData.genders.forEach(gender => {
            const option = document.createElement('option');
            option.value = gender;
            option.textContent = gender;
            genderSelect.appendChild(option);
        });
    }

    if (academicYearSelect) {
        appData.academicYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            academicYearSelect.appendChild(option);
        });
    }

    if (courseSelect) {
        appData.courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseSelect.appendChild(option);
        });
    }

    if (educationSelect) {
        appData.educationLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            educationSelect.appendChild(option);
        });
    }
}

// Setup Event Listeners
function setupEventListeners() {
    if (!elements.form) return;

    // Form submission
    elements.form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation and progress update
    const inputs = elements.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Remove any existing event listeners
        input.removeEventListener('blur', handleFieldBlur);
        input.removeEventListener('input', handleFieldInput);
        input.removeEventListener('change', handleFieldChange);
        
        // Add event listeners
        input.addEventListener('blur', handleFieldBlur);
        input.addEventListener('input', handleFieldInput);
        input.addEventListener('change', handleFieldChange);
    });

    // Character counter for address
    const addressField = document.getElementById('address');
    if (addressField && elements.addressCounter) {
        addressField.addEventListener('input', updateCharacterCounter);
    }

    // Button event listeners
    if (elements.printBtn) {
        elements.printBtn.addEventListener('click', handlePrint);
    }
    if (elements.newRegistrationBtn) {
        elements.newRegistrationBtn.addEventListener('click', handleNewRegistration);
    }
    if (elements.editRegistrationBtn) {
        elements.editRegistrationBtn.addEventListener('click', handleEditRegistration);
    }
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', handleFormReset);
    }

    // Academic year change affects available courses
    const academicYearSelect = document.getElementById('academicYear');
    if (academicYearSelect) {
        academicYearSelect.addEventListener('change', updateCourseOptions);
    }

    // Phone number formatting
    const phoneField = document.getElementById('phone');
    const emergencyPhoneField = document.getElementById('emergencyPhone');
    
    if (phoneField) {
        phoneField.addEventListener('input', formatPhoneNumber);
    }
    if (emergencyPhoneField) {
        emergencyPhoneField.addEventListener('input', formatPhoneNumber);
    }
}

// Event Handlers
function handleFieldBlur(e) {
    validateField(e.target);
}

function handleFieldInput(e) {
    validateField(e.target);
    updateProgress();
    saveFormData();
}

function handleFieldChange(e) {
    validateField(e.target);
    updateProgress();
    saveFormData();
}

// Phone Number Formatting
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    e.target.value = value;
}

// Field Validation
function validateField(field) {
    if (!field || !field.dataset.validation) return true;
    
    const validationTypes = field.dataset.validation.split(',');
    let isValid = true;
    let errorMessage = '';

    for (let type of validationTypes) {
        if (type === 'file') {
            if (!validationRules[type](field)) {
                isValid = false;
                errorMessage = errorMessages[type];
                break;
            }
        } else {
            if (!validationRules[type] || !validationRules[type](field.value)) {
                isValid = false;
                errorMessage = errorMessages[type];
                break;
            }
        }
    }

    // Update field appearance
    field.classList.remove('valid', 'invalid');
    if (field.value.trim() !== '' || field.type === 'file') {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }

    // Show/hide error message
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.toggle('show', !isValid && field.value.trim() !== '');
    }

    // Update validation state
    validationState[field.name] = isValid;
    
    return isValid;
}

// Update Progress
function updateProgress() {
    if (!elements.form) return;
    
    const requiredFields = elements.form.querySelectorAll('[required]');
    const filledFields = Array.from(requiredFields).filter(field => {
        if (field.type === 'file') return true; // File fields are optional
        return field.value.trim() !== '';
    });

    const progress = requiredFields.length > 0 ? Math.round((filledFields.length / requiredFields.length) * 100) : 0;
    
    if (elements.progressFill) {
        elements.progressFill.style.width = `${progress}%`;
    }
    if (elements.progressPercentage) {
        elements.progressPercentage.textContent = progress;
    }
}

// Update Character Counter
function updateCharacterCounter() {
    const addressField = document.getElementById('address');
    if (!addressField || !elements.addressCounter) return;
    
    const currentLength = addressField.value.length;
    elements.addressCounter.textContent = currentLength;
    
    // Change color based on usage
    const counterElement = addressField.parentNode.querySelector('.char-counter');
    if (counterElement) {
        if (currentLength > 180) {
            counterElement.style.color = 'var(--color-warning)';
        } else if (currentLength > 150) {
            counterElement.style.color = 'var(--color-info)';
        } else {
            counterElement.style.color = 'var(--color-text-secondary)';
        }
    }
}

// Update Course Options Based on Academic Year
function updateCourseOptions() {
    const academicYear = document.getElementById('academicYear').value;
    const courseSelect = document.getElementById('course');
    
    if (!courseSelect) return;
    
    // Clear current options except the first one
    courseSelect.innerHTML = '<option value="">Select Course</option>';
    
    // Filter courses based on academic level (simplified logic)
    let availableCourses = [...appData.courses];
    
    if (academicYear === 'Graduate') {
        availableCourses = availableCourses.filter(course => 
            course.includes('AI/Machine Learning') || 
            course.includes('Data Science') || 
            course.includes('Cybersecurity')
        );
    }
    
    availableCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });
}

// Save Form Data to Local Storage
function saveFormData() {
    if (!elements.form) return;
    
    const formData = new FormData(elements.form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    try {
        localStorage.setItem('studentRegistrationData', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving form data:', e);
    }
}

// Load Saved Data from Local Storage
function loadSavedData() {
    const savedData = localStorage.getItem('studentRegistrationData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = document.getElementsByName(key)[0];
                if (field && field.type !== 'file') {
                    field.value = data[key];
                    validateField(field);
                }
            });
            updateProgress();
            updateCharacterCounter();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Handle Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!elements.form) return;
    
    // Validate all fields
    const inputs = elements.form.querySelectorAll('input, select, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
        const fieldValid = validateField(input);
        if (input.hasAttribute('required') && !fieldValid) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showToast('Please correct the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    showLoadingState(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Collect form data
    const formData = new FormData(elements.form);
    const studentData = {};
    
    for (let [key, value] of formData.entries()) {
        studentData[key] = value;
    }
    
    // Generate registration details
    const registrationDetails = {
        id: generateRegistrationId(),
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        data: studentData
    };
    
    // Store registration
    try {
        localStorage.setItem('lastRegistration', JSON.stringify(registrationDetails));
    } catch (e) {
        console.error('Error storing registration:', e);
    }
    
    // Show confirmation
    showConfirmation(registrationDetails);
    
    // Hide loading state
    showLoadingState(false);
    
    // Show success toast
    showToast('Registration completed successfully!', 'success');
}

// Generate Registration ID
function generateRegistrationId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `STU${year}${random}`;
}

// Show Loading State
function showLoadingState(loading) {
    if (!elements.submitBtn) return;
    
    const loadingSpinner = elements.submitBtn.querySelector('.loading-spinner');
    const btnText = elements.submitBtn.querySelector('.btn-text');
    
    if (loading) {
        elements.submitBtn.disabled = true;
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Processing...';
        if (elements.form) elements.form.classList.add('loading');
    } else {
        elements.submitBtn.disabled = false;
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        if (btnText) btnText.textContent = 'Register Student';
        if (elements.form) elements.form.classList.remove('loading');
    }
}

// Show Confirmation
function showConfirmation(registrationDetails) {
    // Hide form section
    if (elements.registrationSection) {
        elements.registrationSection.classList.add('hidden');
    }
    
    // Show confirmation section
    if (elements.confirmationSection) {
        elements.confirmationSection.classList.remove('hidden');
    }
    
    // Update registration info
    if (elements.registrationId) {
        elements.registrationId.textContent = registrationDetails.id;
    }
    if (elements.registrationDate) {
        elements.registrationDate.textContent = registrationDetails.date;
    }
    
    // Generate summary
    generateSummary(registrationDetails.data);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Generate Summary
function generateSummary(data) {
    if (!elements.summaryContent) return;
    
    const sections = [
        {
            title: 'Personal Information',
            fields: [
                { key: 'firstName', label: 'First Name' },
                { key: 'lastName', label: 'Last Name' },
                { key: 'dateOfBirth', label: 'Date of Birth' },
                { key: 'gender', label: 'Gender' }
            ]
        },
        {
            title: 'Contact Information',
            fields: [
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' }
            ]
        },
        {
            title: 'Academic Information',
            fields: [
                { key: 'course', label: 'Course' },
                { key: 'academicYear', label: 'Academic Year' },
                { key: 'previousEducation', label: 'Previous Education' }
            ]
        },
        {
            title: 'Emergency Contact',
            fields: [
                { key: 'emergencyName', label: 'Contact Name' },
                { key: 'emergencyPhone', label: 'Contact Phone' }
            ]
        }
    ];
    
    let summaryHTML = '';
    
    sections.forEach(section => {
        summaryHTML += `
            <div class="summary-section">
                <h4>${section.title}</h4>
                <div class="summary-grid">
        `;
        
        section.fields.forEach(field => {
            const value = data[field.key] || 'Not provided';
            summaryHTML += `
                <div class="summary-item">
                    <span class="summary-label">${field.label}</span>
                    <span class="summary-value">${value}</span>
                </div>
            `;
        });
        
        summaryHTML += `
                </div>
            </div>
        `;
    });
    
    elements.summaryContent.innerHTML = summaryHTML;
}

// Handle Print
function handlePrint() {
    window.print();
}

// Handle New Registration
function handleNewRegistration() {
    if (!elements.form) return;
    
    // Clear form
    elements.form.reset();
    
    // Clear validation states
    const inputs = elements.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    });
    
    // Clear local storage
    try {
        localStorage.removeItem('studentRegistrationData');
    } catch (e) {
        console.error('Error clearing saved data:', e);
    }
    
    // Reset progress
    updateProgress();
    updateCharacterCounter();
    
    // Show form section
    if (elements.registrationSection) {
        elements.registrationSection.classList.remove('hidden');
    }
    if (elements.confirmationSection) {
        elements.confirmationSection.classList.add('hidden');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showToast('Ready for new registration', 'success');
}

// Handle Edit Registration
function handleEditRegistration() {
    // Load the last registration data back into the form
    const lastRegistration = localStorage.getItem('lastRegistration');
    if (lastRegistration) {
        try {
            const registration = JSON.parse(lastRegistration);
            const data = registration.data;
            
            Object.keys(data).forEach(key => {
                const field = document.getElementsByName(key)[0];
                if (field && field.type !== 'file') {
                    field.value = data[key];
                    validateField(field);
                }
            });
            
            updateProgress();
            updateCharacterCounter();
        } catch (e) {
            console.error('Error loading registration data:', e);
        }
    }
    
    // Show form section
    if (elements.registrationSection) {
        elements.registrationSection.classList.remove('hidden');
    }
    if (elements.confirmationSection) {
        elements.confirmationSection.classList.add('hidden');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showToast('You can now edit the registration', 'info');
}

// Handle Form Reset
function handleFormReset(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        if (!elements.form) return;
        
        // Clear form
        elements.form.reset();
        
        // Clear validation states
        const inputs = elements.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
            const errorElement = input.parentNode.querySelector('.error-message');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        });
        
        // Clear local storage
        try {
            localStorage.removeItem('studentRegistrationData');
        } catch (e) {
            console.error('Error clearing saved data:', e);
        }
        
        // Reset progress
        updateProgress();
        updateCharacterCounter();
        
        showToast('Form has been reset', 'info');
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    if (!elements.toast || !elements.toastMessage) return;
    
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Auto-save form data every 30 seconds
setInterval(saveFormData, 30000);

// Handle page visibility changes to save data
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        saveFormData();
    }
});

// Handle beforeunload to save data
window.addEventListener('beforeunload', function() {
    saveFormData();
});