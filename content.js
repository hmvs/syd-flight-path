(async function injectPageScript() {
    // Get selected geojson filename, flows, and airport name from settings
    const DEFAULT_GEOJSON = "SYD all flows v5.geojson";
    const DEFAULT_FLOWS = ["East", "North", "South", "West"];
    const DEFAULT_AIRPORT_NAME = "Sydney Airport";
    const result = await chrome.storage.sync.get(['selectedGeojson', 'selectedFlows', 'selectedAirportName']);
    const geoJsonFileName = result.selectedGeojson || DEFAULT_GEOJSON;
    const flows = result.selectedFlows || DEFAULT_FLOWS;
    const airportName = result.selectedAirportName || DEFAULT_AIRPORT_NAME;
    console.log("Selected geojson file:", geoJsonFileName);
    console.log("Selected airport name:", airportName);

    // Fetch the GeoJSON data
    const geoJsonUrl = chrome.runtime.getURL(`data/${geoJsonFileName}`);
    console.log("Loading geojson URL:", geoJsonUrl);
    let geoJsonData;
    const response = await fetch(geoJsonUrl);
    geoJsonData = await response.json();

    // Create the script element
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.setAttribute("id", "flights-syd");
    script.setAttribute("data-geo-data", JSON.stringify(geoJsonData));
    script.setAttribute("data-airport-name", airportName);
    script.setAttribute("data-flows", JSON.stringify(flows));

    (document.head || document.documentElement).appendChild(script);
})();