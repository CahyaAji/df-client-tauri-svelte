<script>
  import SetFreqGain from "./SetFreqGain.svelte";
  import Options from "./Options.svelte";

  let activeTab = $state("setFreq");
</script>

<div style="height: 100%; display: flex; flex-direction: column;">
  <div style="flex: 1; overflow: auto;">
    {#if activeTab === "setFreq"}
      <SetFreqGain />
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
      class:active={activeTab === "options"}
      onclick={() => (activeTab = "options")}>Options</button
    >
  </div>
</div>

<style>
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
