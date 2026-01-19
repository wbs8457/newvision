// WBS New Vision - Utility Functions

// Get contact information from config
function getContactInfo() {
    return window.SITE_CONFIG?.contact || {
        email: 'contact@wbsnewvision.com',
        phone: '(555) 123-4567'
    };
}

// Update contact information in the DOM
function updateContactInfo() {
    const contact = getContactInfo();
    
    // Update email addresses
    document.querySelectorAll('[data-contact="email"]').forEach(el => {
        el.textContent = contact.email;
        if (el.tagName === 'A') {
            el.href = `mailto:${contact.email}`;
        }
    });
    
    // Update phone numbers
    document.querySelectorAll('[data-contact="phone"]').forEach(el => {
        el.textContent = contact.phone;
        if (el.tagName === 'A') {
            el.href = `tel:${contact.phone.replace(/\s/g, '')}`;
        }
    });
}

// Update site name in the DOM
function updateSiteName() {
    const siteName = window.SITE_CONFIG?.siteName || 'WBS New Vision';
    document.querySelectorAll('[data-site="name"]').forEach(el => {
        el.textContent = siteName;
    });
}

// Update copyright year
function updateCopyrightYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('[data-year="current"]').forEach(el => {
        el.textContent = year;
    });
}

// Initialize all dynamic content
function initializeSiteContent() {
    updateContactInfo();
    updateSiteName();
    updateCopyrightYear();
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSiteContent);
} else {
    initializeSiteContent();
}
