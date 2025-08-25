<script>
  import { udpState, udpStore } from "../stores/udpStore.svelte";

  let isModeAuto = $state(true);
  let errorMessage = $state("");
  let currentFrequency = $state(0);
  let currentFreqMhz = $state(0);
  let currentGain = $state(0);
  const udpPort = 55555;

  $effect(() => {
    if (isModeAuto) {
      if (!udpState.isListening) {
        (async () => {
          try {
            errorMessage = await udpStore.startListening(udpPort);
          } catch (error) {
            errorMessage = "Error starting UDP listener: " + error.message;
          } finally {
            console.log(errorMessage);
          }
        })();
      }
    } else {
      if (udpState.isListening) {
        (async () => {
          try {
            errorMessage = await udpStore.stopListening();
          } catch (error) {
            errorMessage = "Error stopping UDP listener: " + error.message;
          } finally {
            console.log(errorMessage);
          }
        })();
      }
    }
  });

  $effect(() => {
    if (
      isModeAuto &&
      udpState.currentNumb !== null &&
      currentFrequency !== udpState.currentNumb
    ) {
      currentFrequency = udpState.currentNumb;
      currentFreqMhz = Number((currentFrequency / 1000000).toFixed(3));
      console.log("Updated frequency from UDP:", currentFrequency);
    }
  });

  function handleFrequencySet() {
    if (!isModeAuto) {
      //belum
      console.log("manual Set frequency to:", currentFrequency);
    }
  }

  function handleGainSet() {
    //belum
    console.log("Set gain to to:");
  }
</script>

<div class="panel-container">
  <div class="panel-content">
    <div
      style="padding: 4px 8px; border-top: 1px solid lightgray; color: white;"
    >
      Frequency Setting
    </div>
    <div class="frequency-setting">
      <div style="display: flex; margin: 4px 0px">
        <div style="margin-right: 6px;">Frequency Mode :</div>
        <label style="margin-left: 6px;">
          <input type="radio" bind:group={isModeAuto} value={true} />
          Auto
        </label>
        <label style="margin-left: 6px;">
          <input type="radio" bind:group={isModeAuto} value={false} />
          Manual
        </label>
      </div>
      <div>
        <label>
          <span>Frequency:</span>
          <input
            class="input-freq"
            type="number"
            step="0.001"
            bind:value={currentFreqMhz}
          />
          <span>MHz</span>
          <button onclick={handleFrequencySet}>Set</button>
        </label>
      </div>
    </div>
    <div style="color: white; padding: 4px 8px;">Gain Settings</div>
    <div class="gain-setting">
      <label>
        <span style="padding-right: 16px">Gain :</span>
        <select bind:value={currentGain}>
          <option value={0}>0.0</option>
          <option value={0.9}>0.9</option>
          <option value={1.4}>1.4</option>
          <option value={2.7}>2.7</option>
          <option value={3.7}>3.7</option>
          <option value={7.7}>7.7</option>
          <option value={8.7}>8.7</option>
          <option value={12.5}>12.5</option>
          <option value={14.4}>14.4</option>
          <option value={15.7}>15.7</option>
          <option value={16.6}>16.6</option>
          <option value={19.7}>19.7</option>
          <option value={20.7}>20.7</option>
          <option value={22.9}>22.9</option>
          <option value={25.4}>25.4</option>
          <option value={28.0}>28.0</option>
          <option value={29.7}>29.7</option>
          <option value={33.8}>33.8</option>
          <option value={36.4}>36.4</option>
          <option value={37.2}>37.2</option>
          <option value={38.6}>38.6</option>
          <option value={40.2}>40.2</option>
          <option value={42.1}>42.1</option>
          <option value={43.4}>43.4</option>
          <option value={44.5}>44.5</option>
          <option value={48.0}>48.0</option>
          <option value={49.6}>49.6</option>
        </select>
        <button>Set</button>
      </label>
    </div>
  </div>
</div>

<style>
  .panel-container {
    display: flex;
    flex-direction: column;
    background-color: lightgray;
  }

  .panel-content {
    background-color: #141414;
  }

  .frequency-setting {
    display: flex;
    flex-direction: column;
    color: white;
    background-color: #222222;
    padding: 4px 8px;
  }

  button {
    padding: 4px 12px;
  }
  .input-freq {
    padding: 4px 8px;
    width: 110px;
  }

  .gain-setting {
    background-color: #222222;
    color: white;
    padding: 4px 8px;
    margin: 2px 0;
  }
</style>
