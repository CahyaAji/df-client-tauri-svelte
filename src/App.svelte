<script>
  import Header from "./lib/components/Header.svelte";
  import PlotContainer from "./lib/components/PlotContainer.svelte";
  import SetupPanel from "./lib/components/SetupPanel.svelte";
  import StatusWebv from "./lib/components/StatusWebv.svelte";
  import { dfStore } from "./lib/stores/dfStore.svelte.js";
  import { compassStore } from "./lib/stores/compassStore.svelte";
  import {
    getDFSettings,
    setFreqGainApi,
    setAntenna,
  } from "./lib/utils/apihandler.js";
  import { udpState, udpStore } from "./lib/stores/udpStore.svelte.js";
  import { signalState } from "./lib/stores/signalState.svelte";
  import { configStore } from "./lib/stores/Config.Store.svelte";

  let appInitialized = false;

  let isChangingFreq = $state(false);
  let prevFreq = $state(0);
  let retryCount = $state(0);
  const MAX_RETRIES = 3;

  let frequencyDebounceTimer = null;
  const FREQUENCY_DEBOUNCE_MS = 150;
  const MIN_FREQUENCY_CHANGE = 0.001;

  /**
   * @param {number} antSpace
   */
  async function handleSetAntenna(antSpace) {
    try {
      const result = await setAntenna(antSpace);
      if (result.success) {
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

  /**
   * @param {number} newFreq
   * @param {number} newGain
   * @param {number} antSpace
   */
  async function handleSetFreqAndGain(newFreq, newGain, antSpace) {
    try {
      const apiData = {
        center_freq: newFreq,
        uniform_gain: newGain,
        ant_spacing_meters: antSpace,
      };

      const result = await setFreqGainApi(apiData);
      if (result.success) {
        signalState.setFrequency(newFreq);
        signalState.setGain(newGain);
        return true;
      } else {
        console.error("Failed to set frequency and gain:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error setting frequency and gain:", error);
      return false;
    }
  }

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
    let antennaSuccess = false;
    let frequencySuccess = false;

    try {
      // STEP 1: Always set antenna first
      console.log(
        `Setting antenna spacing to ${antSpace}m for frequency ${newFreq}MHz`
      );
      antennaSuccess = await handleSetAntenna(antSpace);

      if (!antennaSuccess) {
        console.log(
          "Antenna setting failed, but continuing with frequency setting"
        );
      }

      // STEP 2: Set frequency and gain
      frequencySuccess = await handleSetFreqAndGain(newFreq, newGain, antSpace);

      if (frequencySuccess) {
        prevFreq = newFreq;
        retryCount = 0;
        console.log(
          `All settings applied successfully - Antenna: ${antennaSuccess ? "OK" : "FAILED"}, Frequency: OK`
        );
      } else {
        throw new Error("Frequency setting failed");
      }
    } catch (error) {
      console.error("Error in frequency setting process:", error);

      // Retry logic - retry the entire process (antenna + frequency)
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(
          `Retrying entire process (attempt ${retryCount}/${MAX_RETRIES})`
        );

        setTimeout(
          () => {
            isChangingFreq = false;
            handleSetFreq(newFreq, newGain);
          },
          1000 + retryCount * 500
        ); // Progressive delay: 1.5s, 2s, 2.5s
        return;
      } else {
        console.error(`Failed after ${MAX_RETRIES} attempts`);
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

      // Load configStore
      try {
        const configResult = await configStore.load();
        if (configResult.success) {
          console.log(
            "configStore loaded succesfully:",
            configStore.allSettings
          );
        } else {
          console.log(
            "Config load failed, using defaults:",
            configResult.error
          );
        }
      } catch (error) {
        console.log("error loading configStore:", error);
      }

      // Start dfStore
      if (!dfStore.isRunning) {
        console.log("Starting dfStore...");
        dfStore.start();
        console.log("DF Store started - will run until app closes");
      } else {
        console.log("dfStore already running");
      }

      // Start CompassStore
      try {
        if (!compassStore.isRunning) {
          compassStore.start();
          console.log("Compass Store started - will run until app closes");
        }
      } catch (error) {
        console.log("Error starting compass store:", error);
      }

      // Load DF Setting
      try {
        const savedDFSettings = await getDFSettings();
        const centerFreq = Number(savedDFSettings.center_freq || 0);
        signalState.setFrequency(centerFreq);

        signalState.setGain(Number(savedDFSettings.uniform_gain || 0));
        signalState.setStationName(savedDFSettings.station_id);

        // setAntenna for initial freq
        if (centerFreq > 0) {
          const antSpace = centerFreq >= 250 ? 0.25 : 0.45;
          await handleSetAntenna(antSpace);
        }

        console.log("Initial settings loaded:", savedDFSettings);
      } catch (error) {
        console.log("Failed to load initial setting config:", error);
      }

      console.log("App initialization completed");
    }

    initialize();

    return async () => {
      if (frequencyDebounceTimer) {
        clearTimeout(frequencyDebounceTimer);
        frequencyDebounceTimer = null;
      }

      dfStore.stop();
      compassStore.stop();

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
  style="display: grid; grid-template-rows: 40px 3fr 4fr 3fr; height: 100vh;"
>
  <Header />
  <StatusWebv />
  <PlotContainer />
  <SetupPanel />
</main>
