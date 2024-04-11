// import preLoadedDataTypes from "/CasablancaBuoy/Assets/Scripts/WMTSDataTypes.js";

// Scripts that obtain data from the CMEMS WMS API
export class WMTSDataRetriever {

  // Requests - keep track of what is requested
  activeRequests = [];
  // Store GetCapabilities XML per product
  productsXML = {};

  dataTypes = {
    "Wave significant height": {
      // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105?request=GetCapabilities&service=WMS
      // https://wmts.marine.copernicus.eu/teroWmts/?service=WMTS&version=1.0.0&request=GetTile&layer=MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105/VHM0&tilematrixset=EPSG:4326&tilematrix=2&tilerow=1&tilecol=4


      /*
      https://wmts.marine.copernicus.eu/teroWmts/?service=WMTS&version=1.0.0&request=GetTile
      &layer=[url]/
      [layerName]
      &tilematrixset=EPSG:4326
      &tilematrix=2&tilerow=1&tilecol=4
      
      */
      name: 'Wave significant height',
      altNames: ['Wave significant height', 'Waves', 'WSH'],
      doi: 'https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012',
      url: 'med-hcmr-wav-rean',// Forecast 'med-hcmr-wav-an-fc',
      domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
      version: '1.0.0',
      layerName: 'VHM0', // 'VMDR' for direction in degrees
      timeScales: ['h'],
      range: [0, 6],
      units: 'm',
      style: "boxfill/alg",//occam_pastel-30",
      animation: {
        layerNames: ['VHM0', 'VMDR'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
      // // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017/cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311?request=GetCapabilities&service=WMS
      forecast: {
        productURL: 'MEDSEA_ANALYSISFORECAST_WAV_006_017/cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311',
        doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
        domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
        version: '1.0.0',
        timeScales: ['h'],
        // CRS instead of SRS
      },
    }
  }




  // CONSTRUCTOR
  constructor(onLoadCallback, verbose){
    // Verbose
    if (verbose){
      this.printLog = this.printLogConsole;
      this.printWarn = this.printWarnConsole;
    } else { // Empty callable function
      this.printLog = ()=> {};
      this.printWarn = ()=> {};
    }

  }



  this.productsXML = {};
  dataTypes = {
    "Wave significant height": {
      domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
      productURL: 'MEDSEA_ANALYSISFORECAST_WAV_006_017/cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311',
      layerName: 'Sea surface wave significant height'
    },
  }

  // Fetch the WMS capabilities and assign to dataType
  loadWMTSLayerCapabilities = async function(dataType){

    let productURL = dataType.productURL;
    let domainURL = dataType.domainURL;

    // Load GetCapabilities of the product if it was not loaded
    if (this.productsXML[productURL] == undefined) {
      let capabilitiesURL = domainURL + productURL + '?request=GetCapabilities&service=WMS';
      // Fetch
      let rawText = await fetch(capabilitiesURL).then(r => r.text());
      let parser = new DOMParser();
      let rawXML = parser.parseFromString(rawText, 'application/xml');
      // Store xml text for reuse
      this.productsXML[productURL] = rawXML;
      // Show available layers
      console.log('------------- New product loaded-----------\nAvailable products:');
      rawXML.querySelectorAll('Layer').forEach(ll => {
        console.log(ll.querySelector('Name').innerHTML);
      });
    }

    let productXML = this.productsXML[productURL];
    // Iterate through layers to find the dataType
    let layers = productXML.querySelectorAll('Layer');
    layers.forEach(ll => {
      // Check if the layer is the one that was requested and that is is queryable
      if (ll.querySelector("Name").innerHTML == dataType.layerName && ll.attributes.queryable) {
        // Variable information
        let varInfo = ll.querySelector('VariableInformation');
        varInfo.childNodes.forEach(ch => {
          if (dataType[ch.nodeName] == undefined)
            dataType[ch.nodeName] = ch.innerHTML;
        });

        // Dimensions (Elevation and Time)
        // Elevation
        if (dd.attributes.name.nodeValue == "elevation") {
          // Get elevation values
          let tmpStr = dd.innerHTML.replace('\n', '[');
          let elevationArray = JSON.parse(tmpStr + ']');
          dataType.elevation = elevationArray;
        }
        // Time dimension
        

      }
    });


  }


  // Test ------
  await loadWMTSLayerCapabilities(dataTypes['Wave significant height'])

}
