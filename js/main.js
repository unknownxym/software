// Main application script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initialize();
    
    // Check authentication status
    checkAuth();
});

// Initialize the application
function initialize() {
    // Initialize event listeners
    setupEventListeners();
    
    // Load software data
    loadSoftwareData();
    
    // Update UI based on authentication
    updateUI();
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Admin panel toggle
    const adminBtn = document.getElementById('adminBtn');
    const closeAdmin = document.getElementById('closeAdmin');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (adminBtn) {
        adminBtn.addEventListener('click', toggleAdminPanel);
    }
    
    if (closeAdmin) {
        closeAdmin.addEventListener('click', closeAdminPanel);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeAdminPanel);
    }
    
    // Form submission
    const softwareForm = document.getElementById('softwareForm');
    if (softwareForm) {
        softwareForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Reset form
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('click', resetFormFields);
    }
}

// Load software data
function loadSoftwareData() {
    if (!window.softwareData || window.softwareData.length === 0) return;
    
    // Get current page category from body data attribute
    const currentPage = document.body.getAttribute('data-category');
    let filteredData = [...window.softwareData];
    
    // Filter by category if not on the home or all-software page
    if (currentPage && currentPage !== 'all') {
        filteredData = window.softwareData.filter(software => 
            software.category === currentPage || 
            (currentPage === 'new' && software.featured) ||
            (currentPage === 'top' && software.downloads > 1000000) // Example threshold for "top"
        );
    }
    
    // Render the filtered list
    renderSoftwareList(filteredData);
    
    // If on home page, also render featured software
    if (currentPage === 'all') {
        const featuredData = window.softwareData.filter(software => software.featured);
        renderFeaturedSoftware(featuredData);
    }
}

// Render software list
function renderSoftwareList(softwareList) {
    const container = document.querySelector('.software-grid');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add each software item to the grid
    softwareList.forEach(software => {
        const softwareCard = createSoftwareCard(software);
        container.appendChild(softwareCard);
    });
}

// Create a software card element
function createSoftwareCard(software) {
    const card = document.createElement('div');
    card.className = 'software-card';
    
    // Ensure image URL is valid, fallback to placeholder
    const imageUrl = software.image || 'https://via.placeholder.com/300x180?text=No+Image';
    
    card.innerHTML = `
        <div class="software-image-container">
            <img src="${imageUrl}" alt="${software.name}" class="software-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x180?text=Image+Not+Available'">
            ${software.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
        </div>
        <div class="software-content">
            <div class="software-info">
                <div class="software-header">
                    <h3 class="software-name">${software.name}</h3>
                    <span class="version">${software.version}</span>
                </div>
                <div class="software-meta">
                    <span class="meta-item category ${software.category}">
                        <i class="fas fa-folder"></i> ${software.category.charAt(0).toUpperCase() + software.category.slice(1)}
                    </span>
                    <span class="meta-item size">
                        <i class="fas fa-hdd"></i> ${software.size}
                    </span>
                </div>
                <p class="description">${software.description}</p>
            </div>
            <div class="software-actions">
                <a href="${software.downloadLink}" class="btn download-btn" data-id="${software.id}" onclick="handleDownload('${software.id}', event); return false;">
                    <i class="fas fa-download"></i> Download Now
                </a>
            </div>
        </div>`;
    
    return card;
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const softwareItems = document.querySelectorAll('.software-card');
    
    softwareItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const description = item.querySelector('.description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Handle download
function handleDownload(softwareId, e) {
    e.preventDefault();
    
    // Find the software by ID
    const software = window.softwareData.find(item => item.id === softwareId);
    if (!software) {
        showNotification('Error: Software not found', 'error');
        return;
    }
    
    try {
        // Update download count in localStorage
        const newDownloadCount = window.updateDownloadCount(softwareId);
        
        // Update the global softwareData reference
        window.softwareData = JSON.parse(localStorage.getItem('softwareData') || '[]');
        
        // Update all download counters for this software
        const downloadElements = document.querySelectorAll(`.downloads[data-id="${softwareId}"]`);
        downloadElements.forEach(el => {
            el.innerHTML = `<i class="fas fa-download"></i> ${formatNumber(newDownloadCount)} downloads`;
        });
        
        // Show download started message
        showNotification(`Starting download: ${software.name} v${software.version}`, 'success');
        
        // Create a temporary link to trigger the download
        const link = document.createElement('a');
        link.href = software.downloadLink;
        link.download = `${software.name.replace(/\s+/g, '_')}_v${software.version}.exe`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Error starting download. Please try again.', 'error');
    }
}

// Toggle admin panel
function toggleAdminPanel(e) {
    e.preventDefault();
    const adminPanel = document.getElementById('adminPanel');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (adminPanel && modalOverlay) {
        adminPanel.classList.toggle('active');
        modalOverlay.style.display = adminPanel.classList.contains('active') ? 'block' : 'none';
    }
}

// Close admin panel
function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (adminPanel && modalOverlay) {
        adminPanel.classList.remove('active');
        modalOverlay.style.display = 'none';
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('softwareName').value;
    const category = document.getElementById('softwareCategory').value;
    const version = document.getElementById('softwareVersion').value;
    const size = document.getElementById('softwareSize').value;
    const description = document.getElementById('softwareDescription').value;
    const image = document.getElementById('softwareImage').value || 'https://via.placeholder.com/300x180?text=No+Image';
    const downloadLink = document.getElementById('githubLink').value;
    const featured = document.getElementById('isFeatured').checked;
    
    // Create new software object
    const newSoftware = {
        id: 'sw' + Date.now(),
        name,
        category,
        version,
        size,
        description,
        image,
        downloadLink,
        downloads: 0,
        featured,
        dateAdded: new Date().toISOString()
    };
    
    // Add to software data
    window.softwareData.unshift(newSoftware);
    
    // Update the UI
    renderSoftwareList(window.softwareData);
    
    // Reset form
    resetFormFields();
    
    // Close admin panel
    closeAdminPanel();
    
    // Show success message
    showNotification(`Added ${name} successfully!`, 'success');
}

// Reset form fields
function resetFormFields() {
    const form = document.getElementById('softwareForm');
    if (form) {
        form.reset();
    }
}

// Check authentication status
function checkAuth() {
    // In a real app, this would check with a server
    // For now, we'll check if there's a token in localStorage
    const token = localStorage.getItem('authToken');
    const isLoggedIn = !!token;
    
    // Update UI based on auth status
    updateAuthUI(isLoggedIn);
    
    return isLoggedIn;
}

// Update UI based on authentication status
function updateAuthUI(isLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    if (adminBtn) adminBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
}

// Update UI
function updateUI() {
    // Update active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage.includes(href.replace('./', '').replace('.html', '')) && href !== './index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update copyright year
    const yearElement = document.querySelector('.copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Set message and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Render featured software on home page
function renderFeaturedSoftware(featuredList) {
    const featuredContainer = document.getElementById('featuredGrid');
    if (!featuredContainer) return;
    
    // Clear existing content
    featuredContainer.innerHTML = '';
    
    // Add each featured software item
    featuredList.forEach(software => {
        const softwareCard = createSoftwareCard(software);
        if (softwareCard) {
            featuredContainer.appendChild(softwareCard);
        }
    });
}

// Make functions available globally
window.handleDownload = handleDownload;
