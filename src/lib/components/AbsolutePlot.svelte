<script>
  import { dfStore } from "../stores/dfStore.svelte.js";
  import { compassStore } from "../stores/compassStore.svelte";
  import { configStore } from "../stores/Config.Store.svelte";

  let compassOffset = $derived(configStore.compassOffset);

  let absHeading = $derived(
    dfStore.data?.heading !== undefined &&
      dfStore.data?.heading !== null &&
      compassStore.data?.heading !== undefined &&
      compassStore.data?.heading !== null
      ? (360 +
          dfStore.data.heading +
          compassStore.data.heading +
          compassOffset) %
          360
      : null
  );
</script>

<div class="circle-container">
  {#if absHeading !== null}
    <div class="rotating-circle" style="transform: rotate({absHeading}deg);">
      <div class="arrow"></div>
    </div>
  {/if}
  <div class="angle-text">
    {#if absHeading !== null}
      <div>{Math.round(absHeading)}</div>
    {:else}
      <div>---</div>
    {/if}
  </div>
</div>

<style>
  .circle-container {
    display: flex;
    margin-top: 8px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background-image: url("/src/assets/absolute-circle.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-color: black;
    position: relative;
  }
  .rotating-circle {
    height: 200px;
    width: 200px;
    border-radius: 50%;
    background-color: transparent;
  }
  .arrow {
    width: 10px;
    height: 50%;
    background-color: white;
    margin: auto;
    border-radius: 4px;
  }
  .angle-text {
    display: flex;
    width: 70px;
    height: 70px;
    align-items: center;
    justify-content: center;
    position: absolute;
    border-radius: 50%;
    border: 2px solid yellow;
    color: white;
    font-size: 24px;
    font-weight: bold;
    background-color: black;
  }
</style>
