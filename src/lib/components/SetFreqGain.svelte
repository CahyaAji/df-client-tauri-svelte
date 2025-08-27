<script>
  import { udpState } from "../stores/udpStore.svelte";
  import { signalState } from "../stores/signalState.svelte";
  import { setFreqGainApi, setAntenna } from "../utils/apihandler";

  let currentFrequency = $state(0);
  let localFreqMhz = $state(0);

  // Initialize local frequency input from store
  $effect(() => {
    localFreqMhz = signalState.currentFreq;
  });

  // Update local frequency display from UDP in auto mode
  $effect(() => {
    if (
      signalState.autoMode &&
      udpState.currentNumb !== null &&
      currentFrequency !== udpState.currentNumb
    ) {
      currentFrequency = udpState.currentNumb;
      localFreqMhz = Number((currentFrequency / 1000000).toFixed(3));
      console.log("Updated frequency display from UDP:", currentFrequency);
    }
  });

  /**
   * @param {number} antSpace
   */
  async function handleSetAntenna(antSpace) {
    console.log(`Setting antenna spacing to ${antSpace}m`);

    try {
      const result = await setAntenna(antSpace);
      if (result.success) {
        console.log(`Antenna spacing set successfully: ${result.data}`);
        return true;
      } else {
        console.log(`Antenna setting failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.log("Error setting antenna:", error);
      return false;
    }
  }

  async function handleFrequencySet() {
    if (!signalState.autoMode) {
      signalState.setFrequency(localFreqMhz);

      const antSpace = localFreqMhz >= 250 ? 0.25 : 0.45;

      try {
        // STEP 1: Set antenna
        console.log(
          `Setting antenna spacing to ${antSpace}m for manual frequency ${localFreqMhz}MHz`
        );
        const antennaSuccess = await handleSetAntenna(antSpace);

        if (!antennaSuccess) {
          console.log(
            "Antenna setting failed, but continuing with frequency setting"
          );
        }

        // STEP 2: Set frequency and gain
        const apiData = {
          center_freq: localFreqMhz,
          uniform_gain: signalState.currentGain,
          ant_spacing_meters: antSpace,
        };
        const result = await setFreqGainApi(apiData);
        if (result.success) {
          console.log(
            `Manual frequency set successfully - Antenna: ${antennaSuccess ? "OK" : "FAILED"}, Frequency: OK`
          );
        } else {
          console.error("API call failed:", result.error);
        }
      } catch (error) {
        console.error("handleFrequencySet error:", error);
      }
    }
  }

  async function handleGainSet() {
    const currentFreq = signalState.currentFreq;
    const antSpace = currentFreq >= 250 ? 0.25 : 0.45;

    try {
      const apiData = {
        center_freq: currentFreq,
        uniform_gain: signalState.currentGain,
        ant_spacing_meters: antSpace,
      };
      const result = await setFreqGainApi(apiData);
      if (result.success) {
        console.log("Manual gain set successfully");
      } else {
        console.error("API call failed:", result.error);
      }
    } catch (error) {
      console.error("handleGainSet error:", error);
    }
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
      <div style="display: flex; margin: 4px 0px; align-items: center;">
        <span style="margin-right: 12px;">Frequency Mode:</span>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              checked={signalState.autoMode === true}
              onchange={() => signalState.setAutoMode(true)}
              name="frequency-mode"
            />
            <span>Auto</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              checked={signalState.autoMode === false}
              onchange={() => signalState.setAutoMode(false)}
              name="frequency-mode"
            />
            <span>Manual</span>
          </label>
        </div>
      </div>
      <div>
        <label>
          <span>Frequency:</span>
          <input
            class="input-freq"
            type="number"
            step="0.001"
            bind:value={localFreqMhz}
            disabled={signalState.autoMode}
          />
          <span>MHz</span>
          <button onclick={handleFrequencySet} disabled={signalState.autoMode}
            >Set</button
          >
        </label>
      </div>
    </div>
    <div style="color: white; padding: 4px 8px;">Gain Settings</div>
    <div class="gain-setting">
      <label>
        <span style="padding-right: 16px">Gain :</span>
        <select bind:value={signalState.currentGain}>
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
        <button onclick={handleGainSet}>Set</button>
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

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-freq {
    padding: 4px 8px;
    width: 110px;
  }

  .input-freq:disabled {
    background-color: #333;
    color: #888;
  }

  .gain-setting {
    background-color: #222222;
    color: white;
    padding: 4px 8px;
    margin: 2px 0;
  }

  .radio-group {
    display: flex;
    gap: 12px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .radio-label input[type="radio"] {
    margin: 0;
  }

  .radio-label:hover {
    opacity: 0.8;
  }
</style>
