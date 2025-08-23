<script>
  import { udpStore, udpCurrentNumb, isUdpListening } from "../stores/udpStore";

  let isModeAuto = $state(true);
  let errorMessage = $state("");
  let currentFrequency = $state(0);
  let currentFreqMhz = $state(0);
  let currentGain = $state(0);
  const udpPort = 55555;

  $effect(() => {
    if (isModeAuto) {
      if (!$isUdpListening) {
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
      if ($isUdpListening) {
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
      $udpCurrentNumb !== null &&
      currentFrequency !== $udpCurrentNumb
    ) {
      currentFrequency = $udpCurrentNumb;
      currentFreqMhz = Number((currentFrequency / 1000000).toFixed(3));
      console.log("Updated frequency from UDP:", currentFrequency);
    }
  });

  function handleFrequencySet() {
    if (!isModeAuto) {
      console.log("manual Set frequency to:", currentFrequency);
    }
  }
</script>

<div class="panel-container">
  <div class="title">Frequency Setting</div>
  <div class="frequency-controls">
    <div>Frequency Mode</div>
    <label>
      <input type="radio" bind:group={isModeAuto} value={true} />
      Auto
    </label>
    <label>
      <input type="radio" bind:group={isModeAuto} value={false} />
      Manual
    </label>
  </div>
  <div class="frequency-input">
    <label>
      <span>Frequency:</span>
      <input type="number" bind:value={currentFreqMhz} />
      <span>MHz</span>
      <button onclick={handleFrequencySet}>Set</button>
    </label>
  </div>
  <div class="gain-input">
    <label>
      <span>Gain: </span>
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

<style>
  .panel-container {
    display: grid;
    grid-template-rows: auto 1fr 1fr auto;
    background-color: lightgray;
  }

  .title {
    padding: 4px 8px;
    background-color: #141414;
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

  .frequency-input {
    background-color: #222222;
    color: white;
    padding: 4px 8px;
  }
  .frequency-input input {
    padding: 2px 8px;
    max-width: 100px;
  }

  .frequency-input button {
    padding: 4px 16px;
  }

  .gain-input {
    background-color: #222222;
    color: white;
    padding: 4px 8px;
  }

  .gain-input button {
    padding: 4px 16px;
  }
</style>
