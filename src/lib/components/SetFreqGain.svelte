<script>
  import { udpState, udpStore } from "../stores/udpStore.svelte";

  let isModeAuto = $state(true);
  let currentFrequency = $state(0);
  let currentFreqMhz = $state(0);
  let currentGain = $state(0);
  const udpPort = 55555;

  $effect(() => {
    if (isModeAuto) {
      if (!udpState.isListening) {
        udpStore
          .startListening(udpPort)
          .then((result) => console.log("UDP started:", result))
          .catch((error) => console.log("Error starting UDP:", error.message));
      }
    } else {
      if (udpState.isListening) {
        udpStore
          .stopListening()
          .then((result) => console.log("UDP stopped:", result))
          .catch((error) => console.log("Error stopping UDP:", error.message));
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
      console.log("Manual set frequency to:", currentFrequency);
    }
  }

  function handleGainSet() {
    console.log("Set gain to:", currentGain);
  }
</script>
