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
  <div style="flex-shrink: 0; padding: 2px; background-color: yellow;">
    <button onclick={() => (activeTab = "setFreq")}>Set Frequency</button>
    <button onclick={() => (activeTab = "options")}>Options</button>
  </div>
</div>

<style>
  button {
    padding: 4px 8px;
  }
</style>
