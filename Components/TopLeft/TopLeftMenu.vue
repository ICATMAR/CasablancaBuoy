<template>
  <div id="top-left-menu" class="top-left vertical-container">


    
      <!-- Compass button -->
      <button class="roundButton icon-big icon-str clickable" @click="compassButtonClicked" :title="$i18n.t('compassButtonTitle')">
        <svg ref="compass-icon" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path id="South" class="south"
            d="M332.782,253.277a25.947,25.947,0,0,1,0,15.446L261.812,461.8c-1.567,4.265-4.109,4.265-5.677,0l-70.97-193.073a25.947,25.947,0,0,1,0-15.446H332.782Z" />
          <path id="North" class="north"
            d="M261.812,52.2l70.97,193.073a25.947,25.947,0,0,1,0,15.446H185.165a25.947,25.947,0,0,1,0-15.446L256.135,52.2C257.7,47.939,260.245,47.939,261.812,52.2Z" />
          <circle id="Center" class="center" cx="260" cy="257" r="10" />
        </svg>
      </button>


      <!-- Buoy button-->
      <button @click="buoyButtonClicked" class="roundButton icon-big icon-str clickable" :title="$i18n.t('buoyButtonTitle')">
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 512 512">
          <path id="Buoy" class="buoyLine"
            d="M237,160c-4.781-7.974-18.144-13.452-23-33-3.366-13.548-1.7-27.055,15-40a39.736,39.736,0,0,1,50,1c14.183,12.3,17.286,32.33,11,46-5.926,12.889-17.827,18.351-21,25-3.9,8.181,40.372,107.418,41,125,0.493,13.813-35.64,91.562-46.12,137.363C257.718,448.292,255.352,444.976,250,445c-4.892.022-7.635,7.094-12.936-13.772C223,375.878,189.094,301.389,189,285,188.868,261.924,242.694,169.5,237,160Z" />
          <path id="SeaSurface" class="seaLine"
            d="M0,265c0.747,0.276,26.493,59.805,50,59,25.725-.881,62.869-58,63-58,0.545,0,46.559,56.567,77,55,29.011-1.493,69.42-57,67-57-2.288,0,46.3,63.112,76,62,28.266-1.058,68.314-61,67-61-0.867,0,41.493,57.342,68,57,24.727-.319,44.789-57.065,44-57" />
        </svg>
      </button>



  </div>
</template>





<script>

export default {
  name: "TopLeftMenu",
  created() {

  },
  mounted() {


  },
  data() {
    return {

    }
  },
  methods: {
    // USER ACTIONS
    
  },
  components: {
  }
}
</script>













<style scoped>
.top-left {
    margin: 0;
    position: absolute;
    top: calc(30px + clamp(70px, 7vw, 100px));;
    left: 10px;
  }

  .vertical-container {
    display: flex;
    flex-direction: column;
    width: fit-content;
    padding: 0;
    align-items: flex-end;
  }



</style>