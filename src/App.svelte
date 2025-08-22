<script>
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import Header from "./lib/components/Header.svelte";
  import PlotContainer from "./lib/components/PlotContainer.svelte";
  import SetupPanel from "./lib/components/SetupPanel.svelte";
  import StatusWebv from "./lib/components/StatusWebv.svelte";

  import { dfStore } from "./lib/stores/dfStore.js";
  import { setFreqGainApi } from "./lib/utils/apihandler.js";
  import {
    udpStore,
    udpCurrentNumb,
    isUdpListening,
  } from "./lib/stores/udpStore.js";

  let udpNotif = $state("");
  let isChangingFreq = $state(false);
  let prevFreq = $state(null);

  /**
   * @param {number} [newFreq]
   */
  async function handleSetFreq(newFreq) {
    if (isChangingFreq || newFreq === prevFreq) return;

    isChangingFreq = true;
    prevFreq = newFreq;

    const antSpace = newFreq >= 250 ? 0.25 : 0.45;
    // setAntena();
    // setGain();

    try {
      const apiData = {
        center_freq: newFreq,
        uniform_gain: 0,
        ant_spacing_meters: antSpace,
      };
      console.log("handleSetFreq called, freq: ", apiData);
      const result = await setFreqGainApi(apiData);
      console.log("handleSetFreq result:", result);
    } catch (error) {
      console.error("App.svelte Error handleSetFreq:", error);
      // prevFreq = null; //reset on error to allow retry
    } finally {
      isChangingFreq = false;
      console.log("handleSetFreq finished");
    }
  }

  $effect(() => {
    if ($udpCurrentNumb >= 24000000 && $udpCurrentNumb <= 1000000000) {
      const freqInMhz = ($udpCurrentNumb / 1000000).toFixed(3);
      if ($isUdpListening && freqInMhz !== null && freqInMhz !== prevFreq) {
        handleSetFreq(Number(freqInMhz));
      }
    }
  });

  onMount(async () => {
    dfStore.start();

    try {
      if (!get(isUdpListening)) {
        udpNotif = await udpStore.startListening(55555);
      } else {
        udpNotif = "UDP already active, using existing listener";
      }
    } catch (err) {
      udpNotif = "UDP error: " + err.message;
    } finally {
      console.log("Parent mount: ", udpNotif);
    }
  });

  onDestroy(async () => {
    dfStore.stop();
    try {
      if (get(isUdpListening)) {
        udpNotif = await udpStore.stopListening();
      } else {
        udpNotif = "UDP was not active";
      }
    } catch (err) {
      udpNotif = "UDP stop error: " + err.message;
    } finally {
      console.log("Parent destroy:", udpNotif);
    }
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
