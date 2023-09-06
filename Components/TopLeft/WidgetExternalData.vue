<template>
  <!-- Container -->
  <div id='widgetExternalData' ref='widgetExternalData'>


    <div>
      <h6>{{$t('Weather and sea conditions')}}</h6>
      {{$t('Date')}}: {{currentDateHTML}}, {{$t('Latitude')}}: {{lat}} º, {{$t('Longitude')}}: {{long}} º
    </div>
    
    
    <!-- Table -->
    <table>
      <!-- Table Head - Days -->
      <thead>
        <tr>
          <td></td>
          <!-- Col for each day -->
          <th class="wcol" style="min-width:40px" :key="dd" v-for="(dd, index) in daysString" :title="dates[index].toISOString()">
            {{$t(dd.split(' ')[0]) + ' ' + dd.split(' ')[1]}}
          </th>
        </tr>
      </thead>
      <!-- Table body - Variables -->
      <tbody>
        <!-- Row -->
        <tr :key="dR.name" v-for="(dR, index) in dataRows">
          <!-- Row name -->
          <th scope="row"><span v-if="dR.imgURL== undefined">{{$t(dR.name)}} ({{dR.units}})</span></th>
          <!-- Values -->
          <td class="wcol" :key="dd.key" v-for="dd in dataRows[index].data">
            <div v-if='dd.loading && !dR.imgURL' class="spinner-border text-light" style="width: 1rem; height: 1rem; position: relative;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div v-else-if='dR.direction' :style="{'transform': 'rotate('+ (-dd.value - 90) +'deg)'}" :title="dd.value + 'º'">&#10140;</div>
            <div v-else-if='dR.imgURL'><img :src=dR.defURL :alt=dR.source :style="getImageStyle(dR, dd)"></div>

            <div v-else-if='!dd.loading' :style="getStyle(dR, dd)">{{dd.value}}</div>
            
          </td>
        </tr>
      </tbody>
      
    </table>

    <div>
      <i>Generated using E.U. Copernicus Marine Service Information; </i>
      <i><a href="https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6" target="_blank" rel="noreferrer noopener">Sea Physics Analysis and Forecast; </a></i>
      <i><a href="https://doi.org/10.25423/CMCC/MEDSEA_MULTIYEAR_PHY_006_004_E3R1" target="_blank" rel="noreferrer noopener">Sea Physics Reanalysis; </a></i>

      <i><a href="https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam3" target="_blank" rel="noreferrer noopener">Sea Waves Analysis and Forecast; </a></i>
      <i><a href="https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012" target="_blank" rel="noreferrer noopener">Sea Waves Reanalysis; </a></i>

      <i><a href="https://doi.org/10.25423/cmcc/medsea_analysisforecast_bgc_006_014_medbfm3" target="_blank" rel="noreferrer noopener">Sea Biogeochemistry Analysis and Forecast; </a></i>
      <i><a href="https://doi.org/10.25423/cmcc/medsea_multiyear_bgc_006_008_medbfm3" target="_blank" rel="noreferrer noopener">Sea Biogechemistry Reanalysis; </a></i>

      <i><a href="https://doi.org/10.48670/moi-00184" target="_blank" rel="noreferrer noopener">Wind L4 Near real Time; </a></i>
      <i><a href="https://doi.org/10.48670/moi-00185" target="_blank" rel="noreferrer noopener">Wind L4 Reprocessed; </a></i>
    </div>

    <!-- Data -->
    <!-- Total sea -->
    <h4>{{ $t('Waves') }}</h4>
    <span>{{ $t('Hm0') }}: {{  }}</span>
    <span>{{ $t('Mdir') }}: {{  }}</span>
    <!-- Primary swell -->

    <!-- Secondary swell -->

    <!-- Wind waves -->



    
    <!-- Data source attribution -->
    <span class="wrapText">{{$t('Data source')}}: <a class="widgetSpan clickable" title="Weather data source" :href="sourceDoi" target="_blank">E.U. CMEMS,
            Copernicus Marine Service</a></span>
    
    <!-- Longitud and latitude -->
    <span class="wrapText" style="user-select: all;">{{$t('Location')}}: Lat: {{lat}} -- Lon: {{long}}</span>
    


  </div>
  </template>
  
  
  <script>
  
  // Import components


  export default {
    name: 'widgetExternalData', // Caps, no -
    created() {
      // Create data retriever
      this.dataRetriever = new WMSDataRetriever();

      // Create data array inside dataRows
      this.dataRows.forEach(dr => {
        dr.data = [];
        for (let i = 0; i < this.numDays; i++)
          dr.data[i] = {value: '', loading: true, key: dr.name ? dr.name + i : dr.key + i};
      });
    },
    mounted() {
      // EVENTS
      
    },
    data (){
      return {
        // Icons
        // https://origin.fontawesome.com/search?o=r&m=free&f=classic
        isWidgetVisible: false,
        // Defaults
        sourceDoi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',




        dataRows: [
          // { // Wind icon
          //   key: 'windicon',
          //   imgURL: 'icons.png',
          //   position: 0,
          //   defURL: 'data/emptyPixel.png',
          //   source: 'Wind',
          //   signRange: [5,15],
          //   color: '#6164ff',
          // },
          // { 
          //   name: "Wind direction",
          //   abbr: "Dir",
          //   units: "º",
          //   direction: true, 
          //   layer: "Wind",
          // },
          // { 
          //   name: "Wind",
          //   abbr: "Wind",
          //   icon: true,
          //   units: "m/s", 
          //   range: [0, 30],
          //   signRange: [5,15],
          //   color: '#6164ff',//'#71c3eb',
          //   colorScale: 'boxfill/sst_36'
          // },
          
          { // Wave icon
            key: 'waveicon',
            imgURL: 'icons.png',
            position: 1,
            defURL: 'https://es.wisuki.com/images/px.png',
            source: 'Wave significant height',
            signRange: [1, 4],
            color: '#6164ff',
          },
          {
            name: "Wave direction",
            abbr: "Dir",
            units: "º", 
            direction: true, 
            layer: "Wave significant height",
          },
          {
            name: "Wave significant height",
            abbr: "Waves",
            icon: true,
            units: "m", 
            range: [0, 8],
            signRange: [0.2,4],
            color: '#6164ff',//'#71c3eb',
            colorScale: 'boxfill/alg',
          },
          {
            name: "Wave period",
            abbr: "T",
            units: "s", 
            range: [0,25],
            signRange: [6,15],
            color: '#6164ff' // TODO: color or colorScale. If color, go from transparent to the specified color.
          },
          { // Current icon
            key: 'currenticon',
            imgURL: 'icons.png',
            position: 2,
            defURL: 'https://es.wisuki.com/images/px.png',
            source: 'Sea surface velocity',
            signRange: [0.25, 1],
            color: '#6164ff',
          },
          {
            name: "Sea current direction",
            abbr: "Dir",
            units: "m/s",
            direction: true,
            layer: "Sea surface velocity",
            color: '#6164ff',//'#71c3eb',
          },        {
            name: "Sea surface velocity",
            abbr: "Current",
            icon: true,
            units: "m/s",
            range: [0, 3],
            signRange: [0.25, 1],
            color: '#6164ff',//'#71c3eb',
          },
          {
            name: "Chlorophyll",
            abbr: "Chl",
            units: "mg/m3", 
            range: [0, 2.5],
            signRange: [0.5,1],
            color: '#6164ff'
          },
          {
            name: "Salinity",
            abbr: "Sal",
            units: "‰", 
            range: [30, 45],
            signRange: [38, 40],
            color: '#6164ff'
          },
          {
            name: "Sea surface temperature",
            abbr: "SST",
            units: 'ºC',
            elevation: true, // TODO: ALLOWS 2D PLOT IF CLICKED ON THE VARIABLE NAME ▼?
            range: [10, 25],
            colorScale: 'boxfill/sst_36',
          },
          {
            name: "Sea bottom temperature",
            abbr: "Bottom t",
            units: 'ºC',
            range: [10, 25],
            colorScale: 'boxfill/sst_36'
          },
        ],
        numDays: 7,
        daysString: [],
        currentDateHTML: '',
        long: 3.227735,
        lat: 42.0728,
      }
    },
    methods: {
      // USER INTERACTION



      // PRIVATE METHODS
      getData: function(lat, long){
        // Get data
        this.dataRows.forEach((rr, rIndex) => {
          this.dates.forEach((date, dIndex) => {
            let layerName = rr.direction ? rr.layer : rr.name;
            // Icon row does not load data
            if (layerName !== undefined){
              this.dataRetriever.getDataAtPoint(layerName, date.toISOString(), lat, long, 'd', rr.direction)
                .then(value => {
                  if (value == undefined){
                    rr.data[dIndex].value = 'x';
                    rr.data[dIndex].loading = false;
                    return;
                  }
                  rr.data[dIndex].value = value.toFixed(2);
                  rr.data[dIndex].loading = false;
                  // Icon
                  if (rr.icon){
                    // Find dataRow with source
                    let iconRow = this.dataRows.filter(e => e.source == rr.name)[0];
                    if (iconRow == undefined) {console.error('Icon is not found for ' + rr.name); return};
                    iconRow.data[dIndex].value = rr.data[dIndex].value;
                    iconRow.data[dIndex].loading = false;
                  }
                })
                .catch(error => {
                  console.error("Can't get CMEMS-WMS " + layerName + " on " + date.getUTCFullYear() + "/" + (date.getMonth()+1));
                  rr.data[dIndex].value = 'x';
                  rr.data[dIndex].loading = false;
                });
            } // end of if
          

          });
        })
      
      
      },



      getStyle: function(dR, dd){
        let color = dR.color;
        let range = dR.signRange ? dR.signRange : dR.range; // Significant range
        let value = dd.value;
        
        let alpha = value == 'x' ? 0 : 255*(value - range[0]) / (range[1] - range[0]);
        alpha = Math.max(Math.min(alpha, 255), 0); // Clamp for HEX conversion

        let textWeight = 'normal';
        if (dR.signRange){
          if (value > (range[0] + 0.33*(range[1]-range[0])))
            textWeight = 'bold';
          else if (value > (range[0] + 0.66*(range[1]-range[0])))
            textWeight = 'bolder';
        }

        return {
          'background-color': color + alpha.toString(16).split('.')[0],
          'font-weight': textWeight,
          'border-radius': '4px',
        }
      },


      // Create image style
      getImageStyle: function(dR, dd){
        let color = dR.color;
        let range = dR.signRange ? dR.signRange : dR.range; // Significant range
        let value = dd.value;
        
        let alpha = value == 'x' ? 0 : (value - range[0]) / (range[1] - range[0]);
        alpha = Math.max(Math.min(alpha, 1), 0); // Clamp for HEX conversion
        //alpha *= 255;

        let colorFactor = 0;
        if (alpha == 0)
          colorFactor = 0;
        else if (alpha < 0.33)
          colorFactor = 1;
        else if (alpha < 0.66)
          colorFactor = 2;
        else
          colorFactor = 3;

        let cssPosition = -dR.position*32 - colorFactor * 32*3;

        // if (alpha/255 == 0){
        //   color = '#9cc6c8';
        // } else if (alpha/255 < 0.33){
        //   color = '#1fcf02';
        // } else if (alpha/255 < 0.66){
        //   color = '#da9000';
        // } else {
        //   color = '#e03636';
        // }

        // // Create linear gradient
        // let linGrad = 'linear-gradient(0deg, ' + color + '66 0%, ' + color + 'ff 100%)'

        return {
          //'background': color + alpha.toString(16).split('.')[0],
          'background-image': 'url('+ dR.imgURL +')',
          'background-position': cssPosition + 'px 0',
          // transform: 'scale(1)',
        }
      },

      // Create dates
      createDates: function(inputDate) {
        // If dates does not exists (initialization)
        this.dates = this.dates == undefined ? this.dates = [] : this.dates;
        let tempDate = new Date(inputDate.getTime());

        for (let i = 0; i < this.numDays; i++){
          this.daysString[this.numDays-1 - i] = tempDate.toDateString().substring(0,2) + ' ' + tempDate.getDate();
          this.dates[this.numDays-1 - i] = new Date(tempDate.getTime());
          tempDate.setDate(tempDate.getDate() - 1);
        }

        
      },


      updateTable: async function(inputDate, long, lat){

        this.lat = lat.toFixed(2);
        this.long = long.toFixed(2);
        let str = inputDate.toString().substring(0,15);
        // Translate
        this.currentDateHTML = this.$i18n.t(str.split(" ")[0]) + " " + this.$i18n.t(str.split(" ")[1]) + " " + str.split(" ")[2] + " " + str.split(" ")[3];

        // Cancel active requests
        this.dataRetriever.cancelActiveRequests();
        // Pause execution so the requests are aborted and the img error events are triggered (img.src=''; img.onerror)
        await new Promise((resolve) => setTimeout(resolve, 200));
        // Reset loading
        this.dataRows.forEach(dr => {
          for (let i = 0; i < this.numDays; i++){
            dr.data[i].value = '';
            dr.data[i].loading = true;
          }
        });
        // Create dates
        this.createDates(inputDate);
        // Update data
        this.getData(lat, long);
      },

      fetchExternalData: function(){
        if (!this.isWidgetVisible)
          return

        let date = new Date();
        this.updateTable(date, this.long, this.lat);

        return;

        
        // Get date
        //let date = new Date();
        //let tmst = date.toISOString();
        
        // Fetch data (promises)
        
        // How to fetch direction also? Check in VISAP!

        // Fetch data:
        // Primary swell direction
        // Primary swell Hm0
        // Primary swell period

        // Secondary swell (three params)

        // Mdir
        // Hm0
        // Period?

        // Wind wave height
        // Wind wave dir
        // Wind wave period

        // 4x3 data points


        // Get clima URL
        let infoWMS = this.dataRetriever.getDataTypeURL(this.selClimaLayer, tmst, 'h');
        this.sourceDoi = infoWMS == undefined ? 'https://resources.marine.copernicus.eu/products' : infoWMS.doi;
        // If source is not found, it will send undefined
        window.eventBus.emit('WidgetExternalData_ClimaLayerChange', infoWMS);
        // Set legend
        this.$refs.wmsLegend.setWMSLegend(infoWMS);
      },


      // PUBLIC METHODS
      setVisible: function(isVisible){
        this.isWidgetVisible = isVisible;
        if (isVisible){
          // Update data
          this.fetchExternalData();
        } else {
          window.eventBus.emit('widgetExternalData_ClimaLayerChange', undefined);
        }
      }
  
    },
    components: {
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #widgetExternalData {
    z-index: 11;
    user-select: none;

    padding-top: 0px !important;
    margin-top: -8px !important;

    max-height: 100%;

    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;

    padding-left: 30px;
  }


  .vertical-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 8px;
  }



  table {
    margin-bottom: 30px;
  }

  .wrow {
    /* display: flex;
    flex-direction: row; */
    /* border:rgb(95, 95, 95);
    border-style: solid; */
    text-align: center;
  }

  .wcol {
    /* border:rgb(252, 252, 252);
    border-style: solid; */
    border-style:none;
    /* flex-grow: 1; */
    text-align: center;
    align-items: center;
    padding: 2px;
  }


  img {
    border-radius: 9px;
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
  }



  

  .isShownInMobile {
    display: none;
  }
  .isHiddenInMobile {
    display: block;
  }


  .cLayerContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 2px;
    background: #0000003b;
    padding-right: 4px;
    border-radius: 30px;

    height: clamp(10px, 3vh, 30px);
  }

  span {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
  }

  .wrapText {
    inline-size: 190px;
    overflow-wrap: break-word;
    pointer-events: all;
  }



  @media screen and (max-width: 500px), screen and (max-height: 850px) {
    /* TODO: ELEMENTS IN A ROW, AS IN WINDY */
    .cLayerIconOnly {
      background: none;
      padding: 0px;
      margin: 1px;
    }

    .horizontal-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      padding: 8px;
    }

    .isShownInMobile{
      display: block;
    }

    .isHiddenInMobile {
      display: none;
    }
    
  }
  
  
  </style>