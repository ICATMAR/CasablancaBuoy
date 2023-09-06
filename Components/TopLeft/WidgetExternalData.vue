<template>
  <!-- Container -->
  <div id='widgetExternalData' ref='widgetExternalData'>

    <!-- Data -->
    <h4>{{ $t('Waves') }}</h4>
    <span>{{ $t('Hm0') }}: {{ hm0 }}</span>
    <span>{{ $t('Mdir') }}: {{ mdir }}</span>


    <!-- Data source attribution -->
    <span class="wrapText">{{$t('Data source')}}: <a class="widgetSpan clickable" title="Weather data source" :href="sourceDoi" target="_blank">E.U. CMEMS,
            Copernicus Marine Service</a></span>
    
    <!-- Longitud and latitude -->
    <span class="wrapText" style="user-select: all;">{{$t('Location')}}: Lat: 42 4' 21.5'' N -- Lon: 3 13' 39.8'' E</span>
    


  </div>
  </template>
  
  
  <script>
  
  // Import components


  export default {
    name: 'widgetExternalData', // Caps, no -
    created() {
      // Create data retriever
      this.dataRetriever = new WMSDataRetriever();
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
      }
    },
    methods: {
      // USER INTERACTION



      // PRIVATE METHODS
      fetchExternalData: function(){
        if (!this.isWidgetVisible)
          return
        
        // Get date
        let date = new Date();
        let tmst = date.toISOString();
        
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