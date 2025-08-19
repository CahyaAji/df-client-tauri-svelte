<script>
  import { onMount, onDestroy } from "svelte";
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

  onMount(async () => {
    dfStore.start();
    udpNotif = await udpStore.startListening(55555);
    console.log(udpNotif);
  });

  onDestroy(async () => {
    dfStore.stop();
    udpNotif = await udpStore.stopListening();
    console.log(udpNotif);
  });
</script>

<main
  style="display: grid; grid-template-rows: 40px 3fr 4fr 3fr; height: 100vh;"
>
  <Header />
  <StatusWebv />
  <PlotContainer />
  <SetupPanel />

  <!-- <div>
    {#if $isUdpListening}
      <div>Listening for UDP messages...</div>
      {#if $udpCurrentNumb !== null}
        <div>Current UDP Number: {$udpCurrentNumb}</div>
      {/if}
    {:else}
      <div>Not listening for UDP messages</div>
    {/if}
  </div> -->
</main>
