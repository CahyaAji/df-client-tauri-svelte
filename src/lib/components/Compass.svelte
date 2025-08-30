<script>
  import { compassStore } from "../stores/compassStore.svelte";
</script>

<div class="panel-container">
  <div class="title">Options</div>
  <div class="panel-content">
    <div>
      <div class="circle">
        {#if compassStore.data && compassStore.data.heading !== undefined && compassStore.data.heading !== null}
          <div
            class="rotating-circle"
            style="transform: rotate({compassStore.data
              .heading}deg); transition: transform 0.2s;"
          >
            <div class="arrow">
              <span
                style="position: relative; top: -20px; right: 3px; text-align: center; font-size: 15pt; color: yellow;"
                >N</span
              >
            </div>
          </div>
        {/if}
      </div>
      {#if compassStore.data && compassStore.data.heading !== undefined && compassStore.data.heading !== null}
        <div class="cmps-value">{Math.round(compassStore.data.heading)}</div>
      {:else}
        <div class="cmps-value">--</div>
      {/if}
    </div>
    <div class="compass-correction">
      <div>Compass Correction</div>
      <input type="number" />
      <button>Set</button>
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
  .panel-content {
    flex: 1;
    display: grid;
    grid-template-columns: 2fr 3fr;
    background-color: #222222;
  }
  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: black;
    border: 1px solid white;
    width: 86px;
    height: 86px;
    margin: 8px auto 6px;
  }
  .rotating-circle {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    background-color: transparent;
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
    padding: 2px 6px;
    width: 80px;
    margin: 2px auto;
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
</style>
