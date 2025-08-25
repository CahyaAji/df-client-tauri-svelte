<script>
  import Header from "./lib/components/Header.svelte";
  import PlotContainer from "./lib/components/PlotContainer.svelte";
  import SetupPanel from "./lib/components/SetupPanel.svelte";
  import StatusWebv from "./lib/components/StatusWebv.svelte";

  import { dfStore } from "./lib/stores/dfStore.svelte.js";
  import { getDFSettings, setFreqGainApi } from "./lib/utils/apihandler.js";
  import { udpState, udpStore } from "./lib/stores/udpStore.svelte.js";
  import { signalState } from "./lib/stores/signalState.svelte";
  import { untrack } from "svelte";

  // Module-level flag to survive HMR
  let appInitialized = false;

  let isChangingFreq = $state(false);
  let prevFreq = $state(0);

  /**
   * @param {number} [newFreq]
   * @param {number} [newGain]
   */
  async function handleSetFreq(newFreq, newGain) {
    if (isChangingFreq || newFreq === prevFreq) return;

    isChangingFreq = true;

    const antSpace = newFreq >= 250 ? 0.25 : 0.45;

    try {
      const apiData = {
        center_freq: newFreq,
        uniform_gain: newGain,
        ant_spacing_meters: antSpace,
      };
      console.log("handleSetFreq called, freq: ", apiData);
      const result = await setFreqGainApi(apiData);
      if (result.success) {
        prevFreq = newFreq;
      } else {
        console.error("API call failed:", result.error);
      }
    } catch (error) {
      console.error("App.svelte Error handleSetFreq:", error);
    } finally {
      isChangingFreq = false;
      console.log("handleSetFreq finished");
    }
  }

  $effect(() => {
    console.log("Frequency effect running, currentNumb:", udpState.currentNumb);

    if (
      udpState.currentNumb >= 24000000 &&
      udpState.currentNumb <= 1000000000
    ) {
      const freqInMhz = Number((udpState.currentNumb / 1000000).toFixed(3));
      console.log(
        "Checking frequency:",
        freqInMhz,
        "isListening:",
        udpState.isListening,
        "prevFreq:",
        prevFreq
      );

      if (udpState.isListening && freqInMhz !== prevFreq) {
        const currentGain = untrack(() => signalState.currentGain);
        console.log("Calling handleSetFreq with:", freqInMhz);
        handleSetFreq(freqInMhz, currentGain);
      }
    }
  });

  // Mount/Destroy effect - start services once and let them run
  $effect(() => {
    console.log("Main effect running, appInitialized:", appInitialized);

    if (appInitialized) {
      console.log("App already initialized, skipping");
      return () => {
        console.log("Skipped initialization cleanup - doing nothing");
      };
    }

    async function initialize() {
      console.log("Initializing app...");
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
      } catch (error) {
        console.log("Failed to load initial setting config:", error);
      }

      try {
        const result = await udpStore.startListening(55555);
        console.log("Parent mount:", result);
      } catch (err) {
        console.log("UDP error:", err.message);
      }
    }

    initialize();

    // Cleanup - only clean up UDP, let dfStore run until process ends
    return async () => {
      console.log(
        "Effect cleanup running - this should only happen on component unmount"
      );
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
