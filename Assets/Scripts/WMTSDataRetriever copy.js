// import preLoadedDataTypes from "/CasablancaBuoy/Assets/Scripts/WMTSDataTypes.js";

// Scripts that obtain data from the CMEMS WMS API
export class WMTSDataRetriever {

  // Requests - keep track of what is requested
  activeRequests = [];
  // Store GetCapabilities XML per product
  productsXML = {};

  dataTypes = {
    "Wave significant height": {
      name: 'Wave significant height',
      altNames: ['Wave significant height', 'WSH', 'VMH0', 'HM0', 'Hs'],
      domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
      productURL: 'MEDSEA_MULTIYEAR_WAV_006_012/',
      dataSetURL: 'med-hcmr-wav-rean-h_202105',
      urlLocked: true,
      doi: 'https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012',
      layerName: 'Sea surface wave significant height',
      timeScales: ['h'],
      // Forecast
      forecast: {
        domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
        productURL: 'MEDSEA_ANALYSISFORECAST_WAV_006_017/',
        dataSetURL: 'cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311',
        urlLocked: true,
        doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
        timeScales: ['h'],
      }
    },
  }

  // dataTypes = {
  //   "Wave significant height": {
  //     // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105?request=GetCapabilities&service=WMS
  //     // https://wmts.marine.copernicus.eu/teroWmts/?service=WMTS&version=1.0.0&request=GetTile&layer=MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105/VHM0&tilematrixset=EPSG:4326&tilematrix=2&tilerow=1&tilecol=4


  //     /*
  //     https://wmts.marine.copernicus.eu/teroWmts/?service=WMTS&version=1.0.0&request=GetTile
  //     &layer=[url]/
  //     [layerName]
  //     &tilematrixset=EPSG:4326
  //     &tilematrix=2&tilerow=1&tilecol=4
      
  //     */
  //     name: 'Wave significant height',
  //     altNames: ['Wave significant height', 'Waves', 'WSH'],
  //     doi: 'https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012',
  //     url: 'med-hcmr-wav-rean',// Forecast 'med-hcmr-wav-an-fc',
  //     domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
  //     version: '1.0.0',
  //     layerName: 'VHM0', // 'VMDR' for direction in degrees
  //     timeScales: ['h'],
  //     range: [0, 6],
  //     units: 'm',
  //     style: "boxfill/alg",//occam_pastel-30",
  //     animation: {
  //       layerNames: ['VHM0', 'VMDR'], // Intensity, Angle
  //       format: 'value_angle',
  //       type: 'wave'
  //     },
  //     // // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017/cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311?request=GetCapabilities&service=WMS
  //     forecast: {
  //       productURL: 'MEDSEA_ANALYSISFORECAST_WAV_006_017/cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311',
  //       doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
  //       domainURL: 'https://wmts.marine.copernicus.eu/teroWmts/',
  //       version: '1.0.0',
  //       timeScales: ['h'],
  //       // CRS instead of SRS
  //     },
  //   }
  // }




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
    

    // Load WMTS
    // Loading control
    let loading = 0;
    let loaded = 0;
    // Iterate data types
    Object.keys(this.dataTypes).forEach(dataTypeKey => {
      let dataType = this.dataTypes[dataTypeKey];
      dataType.timeScaleCorrection = {}; // Introduce new field for time corrections (daily forecast sometimes has 12h instead of 00h)
 
      // Iterate over timescales (some datatypes can be hourly, daily or monthly)
      for (let i = 0; i < dataType.timeScales.length; i++) {
        let currTimeScale = dataType.timeScales[i];

        // Get Capabilities
        loading++;
        this.loadWMTSLayerCapabilities(dataType, currTimeScale)
          .then(() => {
            this.printLog(dataType);
            // Callback when all capabilities have been loaded
            loaded++;
            this.printLog("Total left to load: " + (loading - loaded));
          });
      }
    });

  }



  // Fetch the WMS capabilities and assign to dataType
  loadWMTSLayerCapabilities = async function(dataType, currTimeScale){

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
      // Store some product information (doi, service provider)
      // TODO: does this only work for copernicus? or services that follow a opengis-ows (http://www.opengis.net/ows/1.1) standard?
      // Show available layers
      this.printLog('------------- New product loaded-----------\nAvailable products:');
      rawXML.querySelectorAll('Layer').forEach(ll => {
        this.printLog(ll.querySelector('Name').innerHTML);
      });
    }

    let productXML = this.productsXML[productURL];
    // Iterate through layers to find the dataType
    let layers = productXML.querySelectorAll('Layer');
    layers.forEach(ll => {
      // TODO: WHEN REQUESTING A PRODUCT, MULTIPLE DATA SETS WITH THE SAME VARIABLE CAN APPEAR (hourly, daily, monthly)
      // Check if the layer is the one that was requested and that is is queryable
      if (ll.querySelector("Name").innerHTML == dataType.layerName && ll.attributes.queryable) {

        debugger;
        // Variable information (Id, Name, Unit, min, max, colormap, logscale)
        let varInfo = ll.querySelector('VariableInformation');
        varInfo.childNodes.forEach(ch => {
          if (dataType[ch.nodeName] == undefined)
            dataType[ch.nodeName] = ch.innerHTML;
        });
        this.printLog(varInfo);

        // Dimensions (Elevation and Time)
        ll.querySelectorAll("Dimension").forEach(dd => {
          this.printLog("Dimension name: " + dd.firstChild);

          // Get id (time, elevation)
          let idEl = dd.getElementsByTagName("ows:Identifier")[0];
          if (idEl == undefined)
            debugger; // No id found
          
          let id = idEl.innerHTML;
          // Elevation
          if (id == "elevation") {
            // Get elevation values
            let tmpStr = dd.querySelector("Value").innerHTML.replace('\n', '[');
            let elevationArray = JSON.parse(tmpStr + ']');
            dataType.elevation = elevationArray;
          }
          // Time dimension
          // Latest date and periodicity
          // For example: 2021-11-30T00:00:00Z/2024-05-03T11:00:00Z/PT1H
          else if (id == "time"){
            // Parse time (will depend on month, day)
            // Some data products provide hourly data at hh:30 and other at hh:00
            let timeStr = dd.querySelector("Value").innerHTML;
            // Hourly
            if (currTimeScale == "h") {
              // Get the minutes (innerHTML example: '\n   2021-03-29T00:30:00.000Z/2022-02-28T23:30:00.000Z/PT1H')
              let minutes = timeStr.substring(dd.innerHTML.indexOf('T') + 4, dd.innerHTML.indexOf('T') + 6);
              dataType.timeScaleCorrection.h = { 'min': parseInt(minutes) };
            } else {
              debugger;
            }

            // Get latest date recorded and store it in dataType
            let lastDate = dataType.lastDate == undefined ? new Date(1950) : new Date(dataType.lastDate);
            let timePeriods = timeStr.split(',');
            let lastTime = timePeriods[timePeriods.length - 1];
            if (lastTime.includes('/')){ // Time period e.g., 2019-05-16T12:00:00.000Z/2019-07-16T12:00:00.000Z/P30DT12H
              let endDate = new Date(lastTime.split('/')[1]);
              if (endDate > lastDate)
                dataType.lastDate = endDate.toISOString();
            } else {
              debugger;
              if (new Date(lastTime) > lastDate)
                dataType.lastDate = new Date(lastTime);
            }
          } // end of time dimension

          
        });

        
        

      }
    });


  }


  // Verbose
  printWarnConsole = function(message){
    console.warn(message);
  }
  printLogConsole = function(message){
    console.log(message);
  }

}



export default WMTSDataRetriever;