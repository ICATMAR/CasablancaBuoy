// import preLoadedDataTypes from "/CasablancaBuoy/Assets/Scripts/WMTSDataTypes.js";

// Scripts that obtain data from the CMEMS WMS API
export class WMTSDataRetriever {

  // Requests - keep track of what is requested
  activeRequests = [];
  // Store GetCapabilities XML per product
  productsXML = {};

  products = {
    "Mediterranean Sea Waves Reanalysis": {
      /*
        Available datasets
        VPED, VTPK
        VHM0, VHM0_SW1, VHM0_SW2, VHM0_WW
        VMDR, VMDR_SW1, VMDR_SW2, VMDR_WW
        VSDX, VSDY
        VTM01_SW1, VTM01_SW2, VTM01_WW, VTM02
        VTM10
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105?request=GetCapabilities&service=WMS',
      doi: "https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012",
      timeScales: ['h'],
      dataSets: ['VHM0', 'VHM0_WW', 'VHM0_SW1', 'VHM0_SW2',
                'VTM02', 'VTM01_WW', 'VTM01_SW1', 'VTM01_SW2',
                'VMDR', 'VMDR_WW', 'VMDR_SW1', 'VMDR_SW2'],
    },
    "Mediterranean Sea Waves Analysis and Forecast": {
      // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017?request=GetCapabilities&service=WMS
      /*
      Available datasets
      VCMX, VMXL, VPED, VTPK
      VHM0, VHM0_SW1, VHM0_SW2, VHM0_WW
      VMDR, VMDR_SW1, VMDR_SW2, VMDR_WW
      VSDX, VSDY
      VTM01_SW1, VTM01_SW2 ,VTM01_WW ,VTM02
      VTM10
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
      timeScales: ['h'],
      dataSets: ['VHM0', 'VHM0_WW', 'VHM0_SW1', 'VHM0_SW2',
                'VTM02', 'VTM01_WW', 'VTM01_SW1', 'VTM01_SW2',
                'VMDR', 'VMDR_WW', 'VMDR_SW1', 'VMDR_SW2'],
    },
    "Mediterranean Sea Physics Reanalysis": {
      /*
      Available datasets 
        uo, vo, wo - Current
        so, - Salinity
        zos - Sea Surface Height
        thetao, bottomT - Potential temperature
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_PHY_006_004?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/CMCC/MEDSEA_MULTIYEAR_PHY_006_004_E3R1I',
      timeScales: ['h', 'd', 'm'],
      dataSets: ['uo', 'vo', 'wo', 'so', 'thetao', 'bottomT']
    },
    "Mediterranean Sea Physics Analysis and Forecast": {
      /*
      Available datasets 
        uo, vo, wo - Current
        so, - Salinity
        zos - Sea Surface Height
        thetao, bottomT - Potential temperature
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_PHY_006_013?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS8',
      timeScales: ['h', 'd', 'm'],
      dataSets: ['uo', 'vo', 'wo', 'so', 'thetao', 'bottomT']
    },
    "Mediterranean Sea Biogechemistry Reanalysis": {
      /*
      Available datasets 
        nppv, o2 - Primary Production and Oxygen
        dissic, ph, talk - Dissolved Inorganic Carbon, pH and Alkalinity
        fpco2, spco2 - Surface partial pressure of CO2 and Surface CO2 flux
        nh4, no3, po4 - Nitrate, Phosphate and Ammonium
        chl, phyc - Phytoplankton Carbon Biomass and Chlorophyll
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_BGC_006_008?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/cmcc/medsea_multiyear_bgc_006_008_medbfm3',
      timeScales: ['d', 'm'],
      dataSets: ['chl']
    },
  };

  // Custom dataType definitions
  // One could use standard dictionaries / vocabularies?
  // These are useful for the interface, UI
  customDefinitions = {
    'VHM0': {
      shortName: 'Wave height',
      altNames: ['Hs', 'Hm0', 'Wave significant height', 'Spectral significant wave height (Hm0)'],
      range: [0,6],
      animation: {
        layerNames: ['VHM0', 'VMDR'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
    },
    'VTM02': {
      shortName: 'Wave period',
      altNames: ['Tm02', 'Ts', 'Spectral moments (0,2) wave period'],
      range: [0, 18],
    },
    'VHM0_WW': {
      shortName: 'Wind wave height',
      altNames: ['Wind wave significant height', 'Wind waves', 'WWSH'],
      range: [0,6],
    },
    'VMDR': {
      shortName: 'Wave direction',
      altNames: ['Mean wave direction', 'MDIR'],
      unit: 'º',
      range: [0, 360],
    },
    'VHM0_WW': { // Wind wave height
      range: [0, 6],
      animation: {
        layerNames: ['VHM0_WW', 'VMDR_WW'], // Intensity, Angle
        format: 'value_angle',
        type: 'whiteWave'
      },
    },
    'VHM0_SW1': { // Swell 1 wave height
      range: [0, 6],
      animation: {
        layerNames: ['VHM0_SW1', 'VMDR_SW1'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
    },
    'VHM0_SW2': { // Swell 2 wave height
      range: [0, 6],
      animation: {
        layerNames: ['VHM0_SW2', 'VMDR_SW2'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
    },
    'uo': {
      range: [0, 1.5],
      unit: 'm/s',
    },
    'vo': {
      range: [0, 1.5],
      unit: 'm/s',
    },
    'wo': {
      range: [0, 1.5],
      unit: 'm/s',
    },
    'thetao': {
      shortName: 'Water temperature',
      unit: 'ºC',
    },
    'bottomT': {
      range: [10, 25],
      shortName: 'Bottom temperature',
      unit: 'ºC'
    },
    'salinity': {
      shortName: 'Salinity',
      range: [32, 41],
      unit: '‰',
    },
    'chl': {
      shortName: 'Chlorophyll',
      range: [0.01, 0.3],
      unit: 'mg/m³',
    }
  }



  dataSets = [];
  




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
    Object.keys(this.products).forEach(productKey => {
      let product = this.products[productKey];
      product.name = productKey;

      // Get Capabilities
      loading++;
      this.loadWMTSProduct(product)
        .then(() => {
          this.printLog(this.dataSets);
          // Callback when all capabilities have been loaded
          loaded++;
          this.printLog("Total left to load: " + (loading - loaded));
        });
    });

  }

  // Fetch the WMS capabilities and assign to dataSet
  loadWMTSProduct = async function(product){
    
    // Fetch
    let rawText = await fetch(product.wmtsURL).then(r => r.text());
    let parser = new DOMParser();
    let rawXML = parser.parseFromString(rawText, 'application/xml');
    product.xml = rawXML;
    // Show available layers
    this.printLog('------------- New product loaded-----------\nAvailable products:');
    rawXML.querySelectorAll('Layer').forEach(ll => {
      this.printLog(ll.querySelector('Name').textContent);
    });

    // Iterate available datasets and compare to selected datasets from product
    rawXML.querySelectorAll('Layer').forEach(ll => {
      let id = ll.querySelector('Id').textContent;
      // Get custom dataSet definitions
      let custDef = this.customDefinitions[id] || {};
      // Copy properties to dataSet object
      let dataSet = JSON.parse(JSON.stringify(custDef));
      // Assign properties from WMTS or from custom definitions
      dataSet.id = id;
      dataSet.name = ll.querySelector('Name').textContent;
      dataSet.unit = dataSet.unit || ll.querySelector('Unit').textContent;
      if (dataSet.unit == 'degree'){ dataSet.unit = 'º'; dataSet.range = [0, 360]; }
      // Assign product properties
      dataSet.doi = product.doi;
      dataSet.productName = product.name;
      dataSet.productProvider = product.xml.getElementsByTagNameNS("http://www.opengis.net/ows/1.1", "ProviderName")[0].textContent;
      // Dataset template
      dataSet.template = ll.querySelector('ResourceURL').attributes.template.textContent;
      // Add date to template
      dataSet.template += '&time={Time}';

      // Find if the product belongs to a time scale
      // Iterate through Dimensions (elevation, time)
      ll.querySelectorAll("Dimension").forEach(dd => {
        // Elevation
        if (dd.getElementsByTagName("ows:Identifier")[0].textContent == "elevation") {
          // Get elevation values
          let values = dd.querySelectorAll("Value");
          if (values.length > 1) {
            let elevationArray = [];
            values.forEach(vv => {
              elevationArray.push(vv.textContent);
            });
            dataSet.elevation = elevationArray;
          } else if (values[0].textContent != '0'){
            debugger;
          }          
        }
        // Time dimension
        if (dd.getElementsByTagName("ows:Identifier")[0].textContent == "time") {
          // Text content example: '1993-01-01T00:00:00Z/2022-07-31T23:00:00Z/PT1H'
          let values =  dd.querySelectorAll("Value");
          if (values.length == 1){
            let timeStr = values[0].textContent;
            dataSet.startTmst = timeStr.split('/')[0];
            // Only store end time if it is not forecast
            let endTmst = timeStr.split('/')[1];
            if (new Date(endTmst) < new Date())
              dataSet.endTmst = endTmst;
            let timeInterval = timeStr.split('/')[2];
            dataSet.timeScale = timeInterval == 'PT1H' ? 'h' : timeInterval == 'P1D' ? 'd' : '';
            if (dataSet.timeScale == ''){
              this.printLog("Skipped " + dataSet.name + " at " + timeInterval)
            }
          } else {
            // Calculate time interval
            let timeDiff = Math.abs(new Date(values[0].textContent).getTime() - new Date(values[1].textContent).getTime()) / (1000*60*60*24);
            // Monthly
            if (timeDiff > 25 && timeDiff < 32)
              dataSet.timeScale = 'm';
            else {
              dataSet.timeScale = '';
              this.printLog("Skipped " + dataSet.name + " at " + timeDiff + " days")
            }
            // Store dates
            dataSet.dates = [];
            values.forEach(vv => {
              dataSet.dates.push(vv.textContent);
            });
            // Sort dates
            dataSet.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            // Store start and end dates
            dataSet.startDate = dataSet.dates[0];
            // Only store end time if it is not forecast
            let endTmst = dataSet.dates[dataSet.dates.length - 1];
            if (new Date(endTmst) < new Date())
              dataSet.endTmst = endTmst;
          }
          
        }
      });

      // Store selected dataSets (defined in products variable);
      if (dataSet.timeScale != ''){
        if (product.dataSets.includes(dataSet.id)){
          this.dataSets.push(dataSet);
          this.printLog(dataSet.name +  " at " + dataSet.timeScale);
        }
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