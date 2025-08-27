<script>
  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { signalState } from "../stores/signalState.svelte.js";
  import { turnOffDf, restartDf, setStationId } from "../utils/apihandler.js";
  import { udpState, udpStore } from "../stores/udpStore.svelte.js";
  import { dfStore } from "../stores/dfStore.svelte.js";

  let dfName = $state("");
  let isShuttingDown = $state(false);

  // (one-way sync: store -> local)
  $effect(() => {
    dfName = signalState.stationName;
  });

  async function closeApp() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log("Closing application...");

    try {
      if (udpState.isListening) {
        console.log("Stopping UDP...");
        await udpStore.stopListening();
        console.log("UDP stopped successfully");
      }

      if (dfStore.isRunning) {
        console.log("Stopping DF store...");
        dfStore.stop();
        console.log("DF store stopped successfully");
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }

    // Close app after cleanup
    try {
      console.log("Closing window...");
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (error) {
      console.error("Error closing window:", error);
    }
  }

  async function handleTurnOff() {
    if (isShuttingDown) return;

    console.log("Turning off DF...");
    try {
      await turnOffDf();
      console.log("DF turned off successfully");
    } catch (error) {
      console.error("TurnOff DF error:", error);
    }

    await closeApp();
  }

  async function handleRestart() {
    if (isShuttingDown) return;

    console.log("Restarting DF...");
    try {
      await restartDf();
      console.log("DF restarted successfully");
    } catch (error) {
      console.error("Restart DF error:", error);
    }

    await closeApp();
  }

  async function handleSetName() {
    if (!dfName) {
      console.warn("Unit name is empty");
      return;
    }

    try {
      const response = await setStationId(dfName);
      console.log("success setStationName:", JSON.stringify(response));
      signalState.setStationName(dfName);
    } catch (error) {
      console.error("error setStationName:", error);
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

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
