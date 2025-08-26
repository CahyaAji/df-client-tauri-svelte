<script>
  import { signalState } from "../stores/signalState.svelte.js";
  import { turnOffDf, restartDf, setStationId } from "../utils/apihandler.js";

  let dfName = $state(signalState.stationName);

  function handleTurnOff() {
    turnOffDf();
    console.log("turning off DF");
  }

  function handleRestart() {
    restartDf();
    console.log("restarting DF");
  }

  async function handleSetName() {
    if (!dfName) {
      return;
    }

    try {
      const response = await setStationId(dfName);
      console.log("success setStationName:", JSON.stringify(response));
    } catch (error) {
      console.log("error setStationName: ", error);
    }
  }
</script>

<div class="panel-container">
  <div style="padding: 4px 8px; border-top: 1px solid lightgray; color: white;">
    Options
  </div>
  <div class="panel-content">
    <label style="margin: 4px 8px;">
      <span>Unit Name :</span>
      <input type="text" style="padding: 4px 8px;" bind:value={dfName} />
      <button class="action-button" onclick={handleSetName}>Set</button>
    </label>
    <div class="power-option">
      <div>Power Option</div>
      <div style="display: flex; flex: 1; padding: 8px; margin: auto;">
        <button
          class="action-button"
          style="margin: 4px"
          onclick={handleRestart}>Restart</button
        >
        <button
          class="action-button"
          style="margin: 4px"
          onclick={handleTurnOff}>Turn OFF</button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .panel-container {
    display: flex;
    flex-direction: column;
    background-color: #141414;
  }
  .panel-content {
    display: flex;
    flex-direction: column;
    background-color: #222222;
    color: white;
    flex: 1;
  }
  .power-option {
    display: flex;
    flex-direction: column;
    padding: 8px;
    border-top: 1px solid gray;
  }
  .action-button {
    padding: 4px 16px;
  }
</style>
