<script>
  import { onMount, onDestroy } from "svelte";
  import { udpStore, udpCurrentNumb, isUdpListening } from "../stores/udpStore";

  let isModeAuto = true;
  let udpPort = 55555;
  let errorMessage = "";
  let currentFrequency = 0;
  let isInitialized = false;

  onMount(() => {
    isInitialized = true;
  });

  $: if (isModeAuto && udpCurrentNumb !== null) {
    currentFrequency = $udpCurrentNumb;
  }

  $: if (isInitialized) {
    handleModeChange(isModeAuto);
  }

  /**
   * @param {boolean} isAuto
   */
  async function handleModeChange(isAuto) {
    try {
      errorMessage = "";

      if (isAuto) {
        if (!$isUdpListening) {
          const notif = await udpStore.startListening(udpPort);
          console.log("SetFreqGain: ", notif);
        }
      } else {
        if ($isUdpListening) {
          const notif = await udpStore.stopListening();
          console.log("SetFreqGain: ", notif);
        }
      }
    } catch (error) {
      errorMessage = `setFreqGain : ${error.message}`;
      console.error(errorMessage);
    }
  }

  function handleManualFrequencyChange() {
    if (!isModeAuto) {
      if (currentFrequency < 0 || currentFrequency > 1000000) {
        errorMessage = "Frequency must be between 0-1000000";
      } else {
        errorMessage = "";
      }
    }
  }

  onDestroy(() => {
    isInitialized = false;
  });
</script>

<div class="panel-container">
  <div class="title">Frequency Setting</div>
  <div>
    <div class="frequency-controls">
      <div>Frequency</div>
      <label>
        <input type="radio" bind:group={isModeAuto} value={true} />
        Auto
      </label>
      <label>
        <input type="radio" bind:group={isModeAuto} value={false} />
        Manual
      </label>
    </div>
    ß
    <div>Frequency: {currentFrequency}</div>
  </div>
  <div>Gain</div>
  <div>Bottom Menu</div>
</div>

<style>
  .panel-container {
    display: grid;
    grid-template-rows: auto 1fr 1fr auto;
    background-color: lightgray;
    height: 100%;
  }

  .title {
    padding: 4px 8px;
    background-color: #222222;
    border-top: 1px solid lightgray;
    border-bottom: 2px solid gray;
    color: white;
  }
  .frequency-controls {
    display: flex;
    gap: 8px;
    background-color: #222222;
    color: white;
    padding: 4px 8px;
  }
</style>
