<script>
  import { getCurrentWindow } from "@tauri-apps/api/window";

  import { signalState } from "../stores/signalState.svelte.js";
  import { turnOffDf, restartDf, setStationId } from "../utils/apihandler.js";
  import { udpState, udpStore } from "../stores/udpStore.svelte.js";
  import { dfStore } from "../stores/dfStore.svelte.js";

  let dfName = $state("");
  let isShuttingDown = $state(false);

  // Initialize dfName from store (one-way sync: store -> local)
  $effect(() => {
    dfName = signalState.stationName;
  });

  async function handleTurnOff() {
    if (isShuttingDown) {
      console.log("Shutdown already in progress");
      return;
    }

    isShuttingDown = true;

    try {
      console.log("Turning off DF...");
      await turnOffDf();
      console.log("DF turned off successfully");

      // Wait a moment for DF to fully shut down
      setTimeout(async () => {
        try {
          console.log("Shutting down services and closing app...");

          if (udpState.isListening) {
            await udpStore.stopListening();
            console.log("UDP stopped");
          }

          if (dfStore.isRunning) {
            dfStore.stop();
            console.log("DF store stopped");
          }

          console.log("Closing application window...");
          const appWindow = getCurrentWindow();
          await appWindow.close();
        } catch (error) {
          console.error("Error during shutdown:", error);
          isShuttingDown = false;
        }
      }, 2000);
    } catch (error) {
      console.error("Error turning off DF:", error);
      isShuttingDown = false;
    }
  }

  function handleRestart() {
    restartDf();
    console.log("restarting DF");
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
