<template>
  <!-- Container -->
  <div id='widgetExternalData' ref='widgetExternalData'>


    <div>
      <div v-for="dT in dataTypesToShow" style="display: flex; flex-direction: row; flex-wrap: nowrap;">
        <!-- Data name -->
        <span style="margin-right: 4px;">{{dT}}:</span>
        <!-- Data value -->
        <template v-if="dataValues[dT] !== undefined">
          <!-- Loading -->
          <div v-if='dataValues[dT].loading' class="spinner-border text-light" style="width: 1rem; height: 1rem; position: relative; color:black !important;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <!-- Direction -->
          <div v-else-if='dataValues[dT].direction' 
            :style="{'width': '20px', 'height': '20px', 'transform': 'rotate('+ (-dataValues[dT].value - 90) +'deg)'}" 
            :title="dataValues[dT].value + 'º'"><span>&#10140;</span>
          </div>
          <!-- Value -->
          <span v-else-if='!dataValues[dT].loading'> {{dataValues[dT].value}} {{dataValues[dT].units}}</span>


        </template>
      </div>
    </div>

    <button @click="moreDataClicked"><span>{{$t('More data')}}</span></button>
    
  
    <!-- Date -->
    <div class="timeStringContainer" :title="currentDateHTML">
      <time-string></time-string>
    </div>

    <!-- Location -->
    <span>{{$t('Latitude')}}: {{lat}} º, {{$t('Longitude')}}: {{long}} º</span>
    <!-- Data source attribution -->
    <span class="wrapText">{{$t('Data source')}}: <a class="widgetSpan clickable" title="Weather data source" :href="sourceDoi" target="_blank">E.U. CMEMS,
            Copernicus Marine Service</a></span>

    


  </div>
  </template>
  
  
  <script>
  
  // Import components
  import TimeString from "./TimeString.vue"

  export default {
    name: 'widgetExternalData', // Caps, no -
    created() {
      // Create data retriever
      this.dataRetriever = new WMSDataRetriever();

      // Create data object
      this.dataValues = {};
      this.dataRows.forEach(dr => {
        this.dataValues[dr.name] = {value: undefined, loading: true, key: dr.name};
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
        sourceDoi: 'https://marine.copernicus.eu/',
        dataTypesToShow: [
          'Wave significant height',
          'Wave direction',
          'Wave period',
          'Wind wave significant height',
          'Wind wave direction'
        ],
        dataValues: {},





        dataRows: [
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
            color: '#6164ff', // TODO: color or colorScale. If color, go from transparent to the specified color.
          },
          // Wind waves
          {
            name: "Wind wave direction",
            abbr: "Dir",
            units: "º", 
            direction: true, 
            layer: "Wind wave significant height",
          },
          {
            name: "Wind wave significant height",
            abbr: "Wind waves",
            icon: false,
            units: "m", 
            range: [0, 8],
            signRange: [0.2,4],
            color: '#6164ff',//'#71c3eb',
            colorScale: 'boxfill/alg',
          },
          // Swell 1
          {
            name: "Primary swell wave direction",
            abbr: "Dir",
            units: "º", 
            direction: true, 
            layer: "Primary swell wave significant height",
          },
          {
            name: "Primary swell wave significant height",
            abbr: "Swell 1",
            icon: false,
            units: "m", 
            range: [0, 8],
            signRange: [0.2,4],
            color: '#6164ff',//'#71c3eb',
            colorScale: 'boxfill/alg',
          },
          // Swell 2
          {
            name: "Secondary swell wave direction",
            abbr: "Dir",
            units: "º", 
            direction: true, 
            layer: "Secondary swell wave significant height",
          },
          {
            name: "Secondary swell wave significant height",
            abbr: "Swell 2",
            icon: false,
            units: "m", 
            range: [0, 8],
            signRange: [0.2,4],
            color: '#6164ff',//'#71c3eb',
            colorScale: 'boxfill/alg',
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
          
        ],
        currentDateHTML: '',
        long: 1.345567,
        lat: 40.704597,
        longStr: '1.34',
        latStr: '40.70',
      }
    },
    methods: {
      // USER INTERACTION
      moreDataClicked: function(){
        window.eventBus.emit('OpenCentralPanel', "cmemsPanel");
      },


      // PRIVATE METHODS
      getData: async function(date, lat, long){
        // Get data
        this.dataRows.forEach((rr, rIndex) => {
          let layerName = rr.direction ? rr.layer : rr.name;
          // Icon row and custom SVG does not load data
          if (layerName !== undefined && rr.usesCustomSVG != true){
            this.dataRetriever.getDataAtPoint(layerName, date.toISOString(), lat, long, 'h', rr.direction)
              .then(value => {
                if (value == undefined){
                  this.dataValues[rr.name].value = 'x';
                  this.dataValues[rr.name].loading = false;
                  return;
                }
                this.dataValues[rr.name].value = value.toFixed(2);
                this.dataValues[rr.name].loading = false;
                this.dataValues[rr.name].units = rr.units;
                if (rr.direction)
                  this.dataValues[rr.name].direction = true;

              })
              .catch(error => {
                console.error("Can't get CMEMS-WMS " + layerName + " on " + date.getUTCFullYear() + "/" + (date.getMonth()+1) + "\nError: " + error);
                this.dataValues[rr.name].value = 'x';
                this.dataValues[rr.name].loading = false;
              })
              .finally(() => {
                //this.createCustomSVG();
              });
          } // end of if
          

          
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




      // Create a SVG that represents the swell composition
      createCustomSVG: function(){
        let matrix = [];
        this.dataRows.forEach(dr => {
          
          // Wave sign. height, WW, SW1, SW2
          let index = undefined;
          if (dr.name == 'Wave significant height')
            index = 0;
          else if (dr.name == 'Wind wave significant height')
            index = 1;
          else if (dr.name == 'Primary swell wave significant height')
            index = 2;
          else if (dr.name == 'Secondary swell wave significant height')
            index = 3;
          else if (dr.name == 'Wave direction')
            index = 4;
          else if (dr.name == 'Wind wave direction')
            index = 5;
          else if (dr.name == 'Primary swell wave direction')
            index = 6;
          else if (dr.name == 'Secondary swell wave direction')
            index = 7;
        
          // Store values in matrix
          if (index !== undefined){
            // Create data matrix to use later
            matrix[index] = [];
            for (let i = 0; i < this.numDays; i++){
              let value = parseFloat(dr.data[i].value);
              if (isNaN(value) || value == undefined)
                return;
              matrix[index][i] = value;
            }
          } else {
            return;
          }
        });

        // Create SVG
        this.dataRows.forEach(dr => {
          // Uses custom SVG
          if (dr.usesCustomSVG){
            for (let i = 0; i < this.numDays; i++){
              let wsh = matrix[0][i];
              let wwshNorm = matrix[1][i] / wsh;
              let sw1Norm = matrix[2][i] / wsh;
              let sw2Norm = matrix[3][i] / wsh;
              let wDir = matrix[4][i];
              let wwDir = matrix[5][i];
              let sw1Dir = matrix[6][i];
              let sw2Dir = matrix[7][i];

              // Check that all data is available to create SVG
              for (let j = 0; j < 8; j++){
                if (isNaN(matrix[j][i]) || matrix[j][i] == undefined)
                  return;
              }

              // https://sparkbox.com/foundry/how_to_code_an_SVG_pie_chart
              let size = 40;
              let svgStr = `
                <svg height="26" width="26" viewBox="0 0 26 26" class="clickable" style="width:${size}px; height:${size}px" class="width:${size}px;height:${size}px" >
                  <circle r="10" cx="13" cy="13" fill="var(--lightBlue)" />
                  <polygon points="8, 4.5, 13, 0, 18, 4.5" fill="var(--lightBlue)" transform="rotate(-${wDir}, 13, 13)" />
                  
                  <circle r="4" cx="13" cy="13" fill="transparent" stroke="khaki" stroke-width="8" stroke-dasharray="calc(${wwshNorm}*8*3.142) calc(8*3.142)" transform="rotate(-${90 + wwshNorm*180 + wwDir}, 13, 13)" />
                  <polygon points="${13 - 4 * Math.min(1, wwshNorm*6)}, 6.5, 13, 2, ${13 + 4 * Math.min(1, wwshNorm*6)}, 6.5" fill="khaki" transform="rotate(-${wwDir}, 13, 13)" />

                  <circle r="2.5" cx="13" cy="13" fill="transparent" stroke="var(--blue)" stroke-width="5" stroke-dasharray="calc(${sw1Norm}*5*3.142) calc(5*3.142)" transform="rotate(-${90 + sw1Norm*180 + sw1Dir}, 13, 13)" />
                  <polygon points="${13 - 3 * Math.min(1, sw1Norm*6)}, 9.5, 13, 6, ${13 + 3 * Math.min(1, sw1Norm*6)}, 9.5" fill="var(--blue)" transform="rotate(-${sw1Dir}, 13, 13)" />

                  <circle r="1.5" cx="13" cy="13" fill="transparent" stroke="var(--darkBlue)" stroke-width="3" stroke-dasharray="calc(${sw2Norm}*3*3.142) calc(3*3.142)" transform="rotate(-${90 + sw2Norm*180 + sw2Dir}, 13, 13)" />

                  
                </svg>
                `
              
              dr.data[i].svg = svgStr;
              dr.data[i].loading = false;
            }
          }
        });
      },


      updateTable: async function(inputDate, long, lat){

        this.latStr = lat.toFixed(2);
        this.longStr = long.toFixed(2);
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

        // Update data
        this.getData(inputDate, lat, long);
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
      "time-string": TimeString,
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
    padding: 0 !important;
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