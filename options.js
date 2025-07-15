// Default settings
const DEFAULT_GEOJSON = "SYD all flows v5.geojson";

// DOM elements
let airportSelect;
let saveBtn;
let resetBtn;
let statusDiv;

// Initialize the options page
document.addEventListener('DOMContentLoaded', async function() {
    airportSelect = document.getElementById('airport-select');
    saveBtn = document.getElementById('save-btn');
    resetBtn = document.getElementById('reset-btn');
    statusDiv = document.getElementById('status');

    // Load airports and populate dropdown
    await loadAirports();
    
    // Load saved settings
    await loadSettings();
    
    // Add event listeners
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);
    airportSelect.addEventListener('change', onAirportChange);
});

// Load airports from config.json and populate dropdown
async function loadAirports() {
    try {
        const configUrl = chrome.runtime.getURL('data/config.json');
        const response = await fetch(configUrl);
        const config = await response.json();
        
        // Clear existing options
        airportSelect.innerHTML = '';
        
        // Add airports to dropdown
        config.airports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.geojson;
            option.textContent = airport.name;
            airportSelect.appendChild(option);
        });
        
        console.log('Airports loaded successfully');
    } catch (error) {
        console.error('Error loading airports:', error);
        showStatus('Error loading airport list', 'error');
        
        // Add fallback option
        airportSelect.innerHTML = '<option value="SYD all flows v5.geojson">Sydney Airport (Default)</option>';
    }
}

// Load saved settings from Chrome storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['selectedGeojson', 'selectedFlows', 'selectedAirportName']);
        const selectedGeojson = result.selectedGeojson || DEFAULT_GEOJSON;
        const selectedFlows = result.selectedFlows || [];
        const selectedAirportName = result.selectedAirportName || "Sydney Airport";
        
        // Set the dropdown to the saved value
        airportSelect.value = selectedGeojson;
        
        console.log('Settings loaded:', selectedGeojson, 'with flows:', selectedFlows, 'airport:', selectedAirportName);
    } catch (error) {
        console.error('Error loading settings:', error);
        airportSelect.value = DEFAULT_GEOJSON;
    }
}

// Save settings to Chrome storage
async function saveSettings() {
    try {
        const selectedGeojson = airportSelect.value;
        
        if (!selectedGeojson) {
            showStatus('Please select an airport', 'error');
            return;
        }
        
        // Find the flows for the selected airport
        const configUrl = chrome.runtime.getURL('data/config.json');
        const response = await fetch(configUrl);
        const config = await response.json();
        
        const selectedAirport = config.airports.find(airport => airport.geojson === selectedGeojson);
        const flows = selectedAirport ? selectedAirport.flows : [];
        const airportName = selectedAirport ? selectedAirport.name : "Unknown Airport";
        
        // Save to Chrome storage
        await chrome.storage.sync.set({
            selectedGeojson: selectedGeojson,
            selectedFlows: flows,
            selectedAirportName: airportName
        });
        
        showStatus('Settings saved successfully!', 'success');
        console.log('Settings saved:', selectedGeojson, 'with flows:', flows);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus('Error saving settings', 'error');
    }
}

// Reset settings to default
async function resetSettings() {
    try {
        // Clear storage
        await chrome.storage.sync.clear();
        
        // Reset dropdown to default
        airportSelect.value = DEFAULT_GEOJSON;
        
        showStatus('Settings reset to default', 'success');
        console.log('Settings reset to default');
        
    } catch (error) {
        console.error('Error resetting settings:', error);
        showStatus('Error resetting settings', 'error');
    }
}

// Handle airport selection change
function onAirportChange() {
    // Enable save button when selection changes
    saveBtn.disabled = false;
    
    // Clear any existing status messages
    hideStatus();
}

// Show status message
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(hideStatus, 3000);
    }
}

// Hide status message
function hideStatus() {
    statusDiv.className = 'status';
    statusDiv.textContent = '';
}