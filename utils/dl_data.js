import assert from 'node:assert';
import fs from 'node:fs';
//you can find all this urls from when pages similar to
// https://aircraftnoise.airservicesaustralia.com/2020/04/30/sydney-airport-flight-paths/ loads

const config_jsons = [
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=syd28&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=mel21&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=bne21&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=ool21&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=hbr50&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=hbr53&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=adl22&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=per31&action=get_config",
    "https://focus-apis.emsbk.com/productinfo?product=CommunityInfoMap&sitename=cbr21&action=get_config"
];

// Fetch all config_jsons and read them into memory
const fetchConfigData = async () => {
    const configFile = {
        airports:[]
    }
    for (const url of config_jsons) {
        //config files
        const response = await fetch(url);
        const configObj = await response.json().catch(e=> console.log("error parsing json",response.text()));
        console.log(`Successfully fetched data from ${url}`);
        assert(configObj.config.cim.defaults.tracks.length === 1, `Not sure what to do here, we have not 1 geojson track in ${url}`);
        const trackFileName = configObj.config.cim.defaults.tracks[0];
        const geoJsonUrl = `https://${configObj.config.amazon.s3.hostname}/${configObj.config.amazon.s3.bucket}/${configObj.db_name}/tracks/${trackFileName}`

        //geojson files
        const geoJsonResponse = await fetch(geoJsonUrl);
        const geoJsonData = await geoJsonResponse.text();
        await fs.promises.mkdir('../data', {recursive: true});
        await fs.promises.writeFile(`../data/${trackFileName}`, geoJsonData);
        console.log(`Successfully fetched geojson from ${geoJsonUrl}`);

        const geoJson = JSON.parse(geoJsonData);
        const flows = [...new Set(geoJson.features.filter(f => f.type === "Feature" && f.properties.flow).map(f => f.properties.flow))];

        //our config json
        configFile.airports.push({
            name: configObj.config.airport.name,
            geojson: trackFileName,
            flows: flows
        });
        await fs.promises.writeFile(`../data/config.json`, JSON.stringify(configFile));
    }
};

// Execute the fetch operation
fetchConfigData().then(() => {
    console.log('All done!');
});
