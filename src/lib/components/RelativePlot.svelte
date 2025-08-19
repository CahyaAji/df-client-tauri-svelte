<script>
  import { dfData } from "./../stores/dfStore";
</script>

<div class="circle-container">
  {#if $dfData}
    <div
      class="rotating-circle"
      style="transform: rotate({$dfData.heading}deg);"
    >
      <div class="arrow"></div>
    </div>
  {/if}
  <div class="angle-text">
    {#if $dfData}
      <div>{$dfData.heading}</div>
    {:else}
      <div>---</div>
    {/if}
  </div>
</div>

<style>
  .circle-container {
    display: flex;
    margin-top: 8px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background-image: url("/src/assets/relative-circle.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-color: black;
  }
  .rotating-circle {
    height: 210px;
    width: 210px;
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
