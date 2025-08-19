<script>
  import RelativePlot from "./RelativePlot.svelte";

  let activeTab = "relativeTab";
</script>

<div
  style="display: flex; flex-direction: column; align-items: center; position: relative; background-color: #222222; color: white;"
>
  <div class="title">
    <div>DF</div>
    <div style="display: flex; flex-direction: column;">
      <label>
        <div class="radio-title">
          <input type="radio" value="relativeTab" bind:group={activeTab} />
          <div>Relative</div>
        </div>
      </label>
      <label>
        <div class="radio-title">
          <input type="radio" value="absoluteTab" bind:group={activeTab} />
          <div>Absolute</div>
        </div>
      </label>
      <label>
        <div class="radio-title">
          <input type="radio" value="detailTab" bind:group={activeTab} />
          <div>North Cmps</div>
        </div>
      </label>
    </div>
  </div>
  <div class="plot-container">
    <RelativePlot />
  </div>
</div>

<style>
  .title {
    width: 100%;
    position: absolute;
    padding: 4px;
    display: flex;
    justify-content: space-between;
  }
  .radio-title {
    display: flex;
    padding: 1px 0;
  }
  .plot-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  input[type="radio"] {
    margin-right: 4px;
  }
</style>
