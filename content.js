(async function injectPageScript() {
    // Fetch the GeoJSON data
    const geoJsonUrl = chrome.runtime.getURL("SYDv5.geojson");
    console.log("URL:", geoJsonUrl);
    let geoJsonData;
    try {
        const response = await fetch(geoJsonUrl);
        geoJsonData = await response.json();
    } catch (e) {
        console.error("Error while loading geojson", e);
        return
    }

    // Create the script element
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.setAttribute("id", "flights-syd");
    script.setAttribute("data-geo-data", JSON.stringify(geoJsonData));

    (document.head || document.documentElement).appendChild(script);
})();