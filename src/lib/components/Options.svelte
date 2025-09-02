<script>
  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { signalState } from "../stores/signalState.svelte.js";
  import { turnOffDf, restartDf, setStationId } from "../utils/apihandler.js";
  import { udpState, udpStore } from "../stores/udpStore.svelte.js";
  import { dfStore } from "../stores/dfStore.svelte.js";

  let dfName = $state("");
  let isShuttingDown = $state(false);

  $effect(() => {
    dfName = signalState.stationName;
  });

  async function closeApp() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log("Closing application...");

    try {
      if (udpState.isListening) {
        await udpStore.stopListening();
      }

      if (dfStore.isRunning) {
        dfStore.stop();
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }

    console.log("Waiting 2 seconds before closing...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (error) {
      console.error("Error closing window:", error);
    }
  }

  async function handleTurnOff() {
    if (isShuttingDown) return;

    console.log("Turning off DF...");
    turnOffDf().catch((error) => console.error("TurnOff DF error:", error));

    await closeApp();
  }

  async function handleRestart() {
    if (isShuttingDown) return;

    console.log("Restarting DF...");
    restartDf().catch((error) => console.error("Restart DF error:", error));

    await closeApp();
  }

  async function handleSetName() {
    if (!dfName) {
      console.warn("Unit name is empty");
      return;
    }

    try {
      const response = await setStationId(dfName);
      signalState.setStationName(dfName);
    } catch (error) {
      console.error("error setStationName:", error);
    }
  }
</script>

<div class="panel-container">
  <div class="title">Options</div>
  <div class="panel-content">
    <label style="margin: 4px 8px;">
      <span>Unit Name :</span>
      <input
        type="text"
        style="padding: 4px 8px;"
        bind:value={dfName}
        disabled={isShuttingDown}
      />
      <button
        class="action-button"
        onclick={handleSetName}
        disabled={isShuttingDown}>Set</button
      >
    </label>
    <div class="power-option">
      <div>Power Option</div>
      <div style="display: flex; flex: 1; padding: 8px; margin: auto;">
        <button
          class="action-button"
          style="margin: 4px"
          onclick={handleRestart}
          disabled={isShuttingDown}>Restart</button
        >
        <button
          class="action-button"
          style="margin: 4px"
          onclick={handleTurnOff}
          disabled={isShuttingDown}
          >{isShuttingDown ? "Shutting Down..." : "Turn OFF"}</button
        >
      </div>
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

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
