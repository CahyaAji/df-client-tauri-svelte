<script>
  import Header from "./lib/components/Header.svelte";
  import PlotContainer from "./lib/components/PlotContainer.svelte";
  import SetupPanel from "./lib/components/SetupPanel.svelte";
  import StatusWebv from "./lib/components/StatusWebv.svelte";

  import { dfStore } from "./lib/stores/dfStore.svelte.js";
  import { getDFSettings, setFreqGainApi } from "./lib/utils/apihandler.js";
  import { udpState, udpStore } from "./lib/stores/udpStore.svelte.js";
  import { signalState } from "./lib/stores/signalState.svelte";

  let appInitialized = false;

  let isChangingFreq = $state(false);
  let prevFreq = $state(0);
  let retryCount = $state(0);
  const MAX_RETRIES = 3;

  let frequencyDebounceTimer = null;
  const FREQUENCY_DEBOUNCE_MS = 150;
  const MIN_FREQUENCY_CHANGE = 0.001;

  /**
   * @param {number} [newFreq]
   * @param {number} [newGain]
   */
  async function handleSetFreq(newFreq, newGain) {
    if (isChangingFreq) {
      console.log("Frequency change already in progress, skipping");
      return;
    }

    if (newFreq === prevFreq && retryCount === 0) {
      console.log("Frequency unchanged, skipping");
      return;
    }

    isChangingFreq = true;
    console.log(`handleSetFreq called, freq: ${newFreq}, retry: ${retryCount}`);

    const antSpace = newFreq >= 250 ? 0.25 : 0.45;

    try {
      const apiData = {
        center_freq: newFreq,
        uniform_gain: newGain,
        ant_spacing_meters: antSpace,
      };
      console.log("API call data:", apiData);
      const result = await setFreqGainApi(apiData);

      if (result.success) {
        prevFreq = newFreq;
        retryCount = 0;
        signalState.setFrequency(newFreq);
        console.log(`Frequency successfully set to ${newFreq} MHz`);
      } else {
        console.error("API call failed:", result.error);

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(
            `Retrying in 1 second (attempt ${retryCount}/${MAX_RETRIES})`
          );

          setTimeout(() => {
            isChangingFreq = false;
            handleSetFreq(newFreq, newGain);
          }, 1000);
          return;
        } else {
          // Max retries reached
          console.error(
            `Failed to set frequency after ${MAX_RETRIES} attempts`
          );
          retryCount = 0;
        }
      }
    } catch (error) {
      console.error("Network error in handleSetFreq:", error);

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(
          `Retrying after network error (attempt ${retryCount}/${MAX_RETRIES})`
        );

        setTimeout(() => {
          isChangingFreq = false;
          handleSetFreq(newFreq, newGain);
        }, 2000);
        return;
      } else {
        console.error(`Network error: Failed after ${MAX_RETRIES} attempts`);
        retryCount = 0;
      }
    } finally {
      isChangingFreq = false;
      console.log("handleSetFreq finished");
    }
  }

  // UDP management based on auto mode
  $effect(() => {
    if (signalState.autoMode) {
      if (!udpState.isListening) {
        udpStore
          .startListening(55555)
          .then((result) => console.log("UDP started:", result))
          .catch((error) => console.log("UDP error:", error.message));
      }
    } else {
      if (udpState.isListening) {
        udpStore
          .stopListening()
          .then((result) => console.log("UDP stopped:", result))
          .catch((error) => console.log("UDP stop error:", error.message));
      }
    }
  });

  $effect(() => {
    console.log(
      "Frequency effect running, currentNumb:",
      udpState.currentNumb,
      "autoMode:",
      signalState.autoMode
    );

    if (!signalState.autoMode) {
      // Clear any pending debounced calls
      if (frequencyDebounceTimer) {
        clearTimeout(frequencyDebounceTimer);
        frequencyDebounceTimer = null;
      }
      return;
    }

    if (
      udpState.currentNumb < 24000000 ||
      udpState.currentNumb > 1000000000 ||
      !udpState.isListening
    ) {
      return;
    }

    const freqInMhz = Number((udpState.currentNumb / 1000000).toFixed(3));

    if (!Number.isFinite(freqInMhz) || Number.isNaN(freqInMhz)) {
      console.error(
        "Frequency conversion resulted in invalid number:",
        freqInMhz
      );
      return;
    }

    console.log(
      "Processing frequency:",
      freqInMhz,
      "prevFreq:",
      prevFreq,
      "difference:",
      Math.abs(freqInMhz - prevFreq)
    );

    const frequencyDifference = Math.abs(freqInMhz - prevFreq);
    if (frequencyDifference < MIN_FREQUENCY_CHANGE) {
      console.log("Frequency change too small, ignoring");
      return;
    }

    if (frequencyDebounceTimer) {
      clearTimeout(frequencyDebounceTimer);
    }

    frequencyDebounceTimer = setTimeout(() => {
      console.log("Debounced frequency change triggered:", freqInMhz);

      if (
        signalState.autoMode &&
        udpState.isListening &&
        !isChangingFreq &&
        Math.abs(freqInMhz - prevFreq) >= MIN_FREQUENCY_CHANGE
      ) {
        const currentGain = signalState.currentGain;
        console.log(
          "Calling handleSetFreq with:",
          freqInMhz,
          "gain:",
          currentGain
        );
        handleSetFreq(freqInMhz, currentGain);
      } else {
        console.log(
          "Conditions changed during debounce, skipping frequency update"
        );
      }

      frequencyDebounceTimer = null;
    }, FREQUENCY_DEBOUNCE_MS);

    return () => {
      if (frequencyDebounceTimer) {
        console.log("Cleaning up frequency debounce timer");
        clearTimeout(frequencyDebounceTimer);
        frequencyDebounceTimer = null;
      }
    };
  });

  $effect(() => {
    console.log("Main effect running, appInitialized:", appInitialized);

    if (appInitialized) {
      console.log("App already initialized, skipping");
      return () => {
        console.log("Skipped initialization cleanup - doing nothing");
      };
    }

    async function initialize() {
      appInitialized = true;

      if (!dfStore.isRunning) {
        console.log("Starting dfStore...");
        dfStore.start();
        console.log("DF Store started - will run until app closes");
      } else {
        console.log("dfStore already running");
      }

      try {
        const savedDFSettings = await getDFSettings();
        signalState.setFrequency(Number(savedDFSettings.center_freq || 0));
        signalState.setGain(Number(savedDFSettings.uniform_gain || 0));
        signalState.setStationName(savedDFSettings.station_id);
        console.log("Initial settings loaded:", savedDFSettings);
      } catch (error) {
        console.log("Failed to load initial setting config:", error);
      }

      console.log("App initialization completed");
    }

    initialize();

    return async () => {
      console.log(
        "Effect cleanup running - this should only happen on component unmount"
      );

      if (frequencyDebounceTimer) {
        clearTimeout(frequencyDebounceTimer);
        frequencyDebounceTimer = null;
      }

      try {
        const result = await udpStore.stopListening();
        console.log("Parent destroy:", result);
      } catch (err) {
        console.log("UDP stop error:", err.message);
      }
    };
  });
</script>

<main
  style="display: grid; grid-template-rows: 40px 4fr 4fr 3fr; height: 100vh;"
>
  <Header />
  <StatusWebv />
  <PlotContainer />
  <SetupPanel />
</main>
