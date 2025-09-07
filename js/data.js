// Initialize software data from localStorage or use default
let softwareData = [];

// Default Malwarebytes data
const defaultSoftwareData = [
    {
        id: 'mb1',
        name: 'Malwarebytes',
        category: 'security',
        version: 'latest version',
        size: '250 MB',
        description: 'Comprehensive anti-malware solution that provides protection against viruses, ransomware, and other online threats with real-time protection.',
        image: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4wErm',
        downloadLink: 'https://data-cdn.mbamupdates.com/web/mb5-setup-consumer/MBSetup.exe',
        featured: true,
        downloads: 0,
        dateAdded: new Date().toISOString()
    }
];

// Load data from localStorage or initialize with default data
function loadSoftwareData() {
    const savedData = localStorage.getItem('softwareData');
    if (savedData) {
        try {
            // Parse and filter out empty or invalid entries
            const parsedData = JSON.parse(savedData);
            softwareData = parsedData.filter(software => 
                software && 
                software.name && 
                software.name.trim() !== '' && 
                software.category &&
                software.downloadLink
            );
            
            // If no valid software left, use default
            if (softwareData.length === 0) {
                softwareData = [...defaultSoftwareData];
                saveSoftwareData();
            }
        } catch (e) {
            console.error('Error parsing saved data, using default', e);
            softwareData = [...defaultSoftwareData];
            saveSoftwareData();
        }
    } else {
        softwareData = [...defaultSoftwareData];
        saveSoftwareData();
    }
}

// Save data to localStorage
function saveSoftwareData() {
    try {
        localStorage.setItem('softwareData', JSON.stringify(softwareData));
        return true;
    } catch (e) {
        console.error('Error saving data', e);
        return false;
    }
}

// Update download count for a software
function updateDownloadCount(softwareId) {
    const software = softwareData.find(item => item.id === softwareId);
    if (software) {
        software.downloads = (software.downloads || 0) + 1;
        saveSoftwareData();
        return software.downloads;
    }
    return 0;
}

// Initialize data
loadSoftwareData();

// Make data and functions available globally
window.softwareData = softwareData;
window.updateDownloadCount = updateDownloadCount;
window.loadSoftwareData = loadSoftwareData;
