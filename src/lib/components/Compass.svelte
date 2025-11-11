<script>
  import { compassStore } from "../stores/compassStore.svelte";
  import { configStore } from "../stores/Config.Store.svelte";

  let inputOffset = $state(0);
  let errorMessage = $state("");

  let compassOffset = $derived(configStore.compassOffset);

  async function handleSetOffset() {
    if (inputOffset === null || inputOffset === undefined) {
      console.warn("offset value is empty");
      errorMessage = "Offset tidak boleh kosong";
      setTimeout(() => {
        errorMessage = "";
      }, 1500);
      return;
    }

    if (inputOffset < -360 || inputOffset > 360) {
      errorMessage = "Offset harus diantara -360 sampai 360";
      setTimeout(() => {
        errorMessage = "";
      }, 1500);
      return;
    }

    const result = await configStore.setCompassOffset(inputOffset);
    if (result.success) {
      console.log("Compass offset updated successfully");
    } else {
      console.error("Failed to update compass offset:", result.error);
      errorMessage = "Error: Gagal mengatur offset";
      setTimeout(() => {
        errorMessage = "";
      }, 1500);
    }
  }

  $effect(() => {
    inputOffset = compassOffset;
  });
</script>

<div class="panel-container">
  {#if errorMessage}
    <div class="error-message">{errorMessage}</div>
  {:else}
    <div class="title">Compass</div>
  {/if}
  <div class="panel-content">
    <div class="compass-display">
      <div class="compass">
        {#if compassStore.data !== undefined && compassStore.data !== null}
          <div
            class="rotating-circle"
            style="transform: rotate({360 -
              compassStore.data -
              compassOffset}deg); transition: transform 0.2s;"
          >
            N
          </div>
        {/if}
        <div class="circle">
          <div class="arrow"></div>
        </div>
      </div>
      {#if compassStore.data && compassStore.data !== undefined && compassStore.data !== null}
        <div class="cmps-value">
          {(Math.round(compassStore.data + compassOffset) + 360 ) % 360}°
        </div>
      {:else}
        <div class="cmps-value">--</div>
      {/if}
    </div>
    <div class="compass-correction">
      <div>Compass Correction</div>
      <input
        type="number"
        bind:value={inputOffset}
        step="0.1"
        lang="en-US"
        placeholder="Enter Offset"
      />
      <button onclick={handleSetOffset} disabled={configStore.isLoading}>
        {configStore.isLoading ? "Saving..." : "Set"}
      </button>
      {#if configStore.error}
        <div class="error">Error: {configStore.error}</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-top: 1px solid lightgray;
  }
  .title {
    background-color: #141414;
    padding: 8px 8px 4px;
    color: white;
  }
  .error-message {
    background-color: #ffdddd;
    color: #d8000c;
    padding: 8px 8px 4px;
  }
  .panel-content {
    flex: 1;
    display: grid;
    grid-template-columns: 2fr 3fr;
    background-color: #222222;
  }
  .compass-display {
    display: flex;
    flex-direction: column;
    padding: auto;
  }
  .compass {
    position: relative;
    margin: auto;
    display: flex;
    width: 122px;
    height: 122px;
    align-items: center;
    justify-content: center;
  }
  .rotating-circle {
    position: absolute;
    display: flex;
    width: 122px;
    height: 122px;
    border-radius: 50%;
    justify-content: center;
    margin: auto;
    color: yellow;
    font-size: 16pt;
  }
  .circle {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: auto;
    border: 1px solid white;
  }
  .arrow {
    width: 6px;
    height: 50%;
    background-color: white;
    margin: auto;
    border-radius: 4px;
  }
  .cmps-value {
    text-align: center;
    background-color: black;
    color: white;
    font-size: 13pt;
    padding: 4px 6px;
    width: 80px;
    margin: auto;
    border-radius: 15px;
  }
  .compass-correction {
    display: flex;
    flex-direction: column;
    padding: 20px 6px 6px;
    align-items: center;
    gap: 8px;
    color: white;
  }
  .compass-correction > input {
    padding: 3px 8px;
    max-width: 100px;
  }
  .compass-correction > button {
    padding: 6px 16px;
  }
  .compass-correction > button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
