window.selectedFlow = "None";


function featureStyleFilter(f) {
    if (f.getProperty("flow") === window.selectedFlow || window.selectedFlow === "All") {
        const color =  f.getProperty("color").substring(2,8);
        return {
            visible: true,
            strokeColor: "#" + color,
            strokeOpacity: 1,
            strokeWeight: 1,
        };
    }
    return { visible: false };
}

function setupMap(){
  window.foundMap.data.loadGeoJson(
    "https://s3-us-west-2.amazonaws.com/community-info-map-data/syd28/tracks/SYD%20all%20flows%20v5.geojson",
  );
  window.selectedFlow = "None";
  window.foundMap.data.setStyle(featureStyleFilter);
    
 // 1. Create and style the container DIV inline
    const controlDiv = document.createElement('div');
    Object.assign(controlDiv.style, {
      position:   'absolute',             
      top:        '10px',                 
      left:       '50%',                  
      transform:  'translateX(-50%)',     
      background: '#fff',                 
      padding:    '4px',                  
      zIndex:     '1'                 
    });

    // 2. Build the <select> and options
    const select = document.createElement('select');
    ['None','East','North','South','West','All'].forEach(dir => {
      const opt = document.createElement('option');
      opt.value = dir;
      opt.textContent = dir;
      select.appendChild(opt);
    });

    controlDiv.appendChild(select);
    window.foundMap.getDiv().appendChild(controlDiv);

  // 5. Handle changes
  select.addEventListener("change", () => {
    const choice = select.value;
    console.log("Selected direction:", choice);
    window.selectedFlow = choice;
    window.foundMap.data.setStyle(featureStyleFilter);
  });
}


function findMap(obj, seen = new WeakSet()) {
  // Base cases
  if (obj instanceof window.google.maps.Map) {
    return obj;
  }
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) {
    return null;
  }
  seen.add(obj);

  // Reflect.ownKeys covers normal keys + symbols
  for (let key of Reflect.ownKeys(obj)) {
    let val;
    try {
      val = obj[key];
    } catch (err) {
      // some properties may throw – just skip them
      continue;
    }
    const found = findMap(val, seen);
    if (found) {
      return found;
    }
  }

  return null;
}


const interval = setInterval(() => {
  console.log("Looking for map interval!");
  try{
    if (window.google?.maps?.Map && window.google.maps.Map instanceof Object) {
      console.log("Google maps defined");
      window.foundMap = findMap(window.document);
      if (window.foundMap) {
        console.log("FOUND MAP!!!!!");
        clearInterval(interval);
        setupMap();
      } else console.log("Map not found");
    } else console.log("Google maps not defined");
  }catch(e){
    console.log("Error search for a map", e);
  }

}, 5000);