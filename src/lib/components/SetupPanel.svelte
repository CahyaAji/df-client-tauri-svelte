<script>
  import SetFreqGain from "./SetFreqGain.svelte";
  import Options from "./Options.svelte";
  import Compass from "./Compass.svelte";
  import Gps from "./GPS.svelte";

  let activeTab = $state("setFreq");
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
