<script>
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import Header from "./lib/components/Header.svelte";
  import PlotContainer from "./lib/components/PlotContainer.svelte";
  import SetupPanel from "./lib/components/SetupPanel.svelte";
  import StatusWebv from "./lib/components/StatusWebv.svelte";

  import { dfStore } from "./lib/stores/dfStore.js";
  import {
    udpStore,
    udpCurrentNumb,
    isUdpListening,
  } from "./lib/stores/udpStore.js";

  let udpNotif = "";

  $: if (isUdpListening && udpCurrentNumb !== null) {
    console.log("UDP now: " + udpCurrentNumb);
  }

  onMount(async () => {
    dfStore.start();

    try {
      // only call if not already listening
      if (!get(isUdpListening)) {
        udpNotif = await udpStore.startListening(55555);
      } else {
        udpNotif = "UDP already active, using existing listener";
      }
    } catch (err) {
      udpNotif = "UDP error: " + err.message;
    } finally {
      console.log("Parent mount:", udpNotif);
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
  style="display: grid; grid-template-rows: 40px 3fr 4fr 3fr; height: 100vh;"
>
  <Header />
  <StatusWebv />
  <PlotContainer />
  <SetupPanel />
</main>
