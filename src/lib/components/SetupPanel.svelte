<script>
  import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
  import SetFreqGain from "./SetFreqGain.svelte";
  import Options from "./Options.svelte";
  import Compass from "./Compass.svelte";
  import Gps from "./GPS.svelte";
  import { API_URL } from "../utils/apihandler";

  let activeTab = $state("setFreq");

  async function openSpectrum() {
    const spectrumWindow = new WebviewWindow("spectrum-window", {
      title: "elangdf - Spectrum",
      url: `${API_URL}/spectrum`,
      width: 800,
      height: 600,
      resizable: true,
      center: true,
    });

    spectrumWindow.once("tauri://created", () => {
      console.log("Spectrum window created");
    });

    spectrumWindow.once("tauri://error", (e) => {
      console.error("Failed to create spectrum window:", e);
    });

    spectrumWindow.once("tauri://destroyed", () => {
      console.log("Spectrum window was closed");
      window.location.reload();
    });
  }
</script>

<div class="panel-container">
  <div style="flex: 1; overflow: auto;">
    {#if activeTab === "setFreq"}
      <SetFreqGain />
    {:else if activeTab === "compass"}
      <Compass />
    {:else if activeTab === "GPS"}
      <Gps />
    {:else if activeTab === "options"}
      <Options />
    {/if}
  </div>
  <div style="flex-shrink: 0; padding: 2px; background-color: #141414; gap: 0">
    <button
      class:active={activeTab === "setFreq"}
      onclick={() => (activeTab = "setFreq")}>Set Frequency</button
    >
    <button
      class:active={activeTab === "compass"}
      onclick={() => (activeTab = "compass")}>Compass</button
    >
    <button
      class:active={activeTab === "GPS"}
      onclick={() => (activeTab = "GPS")}>GPS</button
    >
    <button
      class:active={activeTab === "options"}
      onclick={() => (activeTab = "options")}>Options</button
    >
    <button onclick={openSpectrum}>Spectrum</button>
  </div>
</div>

<style>
  .panel-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: orange;
  }
  button {
    padding: 4px 8px;
    margin: 0;
    color: white;
    background-color: #222222;
    border: 1px solid #555;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: #444;
  }

  button.active {
    background-color: #666;
    color: white;
    border-color: #888;
  }
</style>
