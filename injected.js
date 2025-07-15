window.selectedFlow = "None";

function featureStyleFilter(f) {
    if (f.getProperty("flow") === window.selectedFlow || window.selectedFlow === "All") {
        const color = f.getProperty("color").substring(2, 8);
        return {
            visible: true, strokeColor: "#" + color, strokeOpacity: 1, strokeWeight: 1,
        };
    }
    return {visible: false};
}

function setupMap() {
    const scriptTag = document.getElementById("flights-syd");
    const geoData = JSON.parse(scriptTag.getAttribute("data-geo-data"));
    const airportName = scriptTag.getAttribute("data-airport-name");
    const flows = JSON.parse(scriptTag.getAttribute("data-flows"));
    scriptTag.remove();

    window.foundMap.data.addGeoJson(geoData);
    window.selectedFlow = "None";
    window.foundMap.data.setStyle(featureStyleFilter);

    //Control div
    const controlDiv = document.createElement('div');
    Object.assign(controlDiv.style, {
        position: 'absolute', top: '10px', right: '100px', background: '#fff', padding: '4px', zIndex: '1'
    });
    
    // Add airport name label
    const airportLabel = document.createElement('span');
    airportLabel.textContent = airportName + ': ';
    Object.assign(airportLabel.style, {
        marginRight: '5px', fontWeight: 'bold'
    });
    controlDiv.appendChild(airportLabel);
    
    const select = document.createElement('select');
    const dropdownOptions = ['None', ...flows, 'All'];
    dropdownOptions.forEach(dir => {
        const opt = document.createElement('option');
        opt.value = dir;
        opt.textContent = dir;
        select.appendChild(opt);
    });
    controlDiv.appendChild(select);
    window.foundMap.getDiv().appendChild(controlDiv);
    select.addEventListener("change", () => {
        const choice = select.value;
        console.log("Selected direction:", choice);
        window.selectedFlow = choice;
        window.foundMap.data.setStyle(featureStyleFilter);
    });
}

function findMap(obj, seen = new WeakSet()) {
    if (obj instanceof window.google.maps.Map) {
        return obj;
    }
    if (obj === null || typeof obj !== 'object' || seen.has(obj)) {
        return null;
    }
    seen.add(obj);

    for (let key of Reflect.ownKeys(obj)) {
        let val;
        try {
            val = obj[key];
        } catch (err) {
            continue;
        }
        const found = findMap(val, seen);
        if (found) {
            return found;
        }
    }

    return null;
}

let searchMapAttempts = 0;
const interval = setInterval(() => {
    if (searchMapAttempts++ > 60) {
        console.log("We give up searching for the map");
        clearInterval(interval);
    }
    console.log("Looking for map interval");

    try {
        if (window.google?.maps?.Map && window.google.maps.Map instanceof Object) {
            console.log("Google maps defined");
            window.foundMap = findMap(window);
            if (window.foundMap) {
                console.log("FOUND MAP!!!!!");
                clearInterval(interval);
                setupMap();
            } else console.log("Map not found");
        } else console.log("Google maps not defined");
    } catch (e) {
        console.log("Error search for a map", e);
    }
}, 1000);
