<!-- src/lib/components/UdpRealtime.svelte -->
<script>
  import {
    udpStore,
    udpCurrentNumb,
    isUdpListening,
  } from "../stores/udpStore.svelte.js";

  let port = 55555;
  let numberToSend = 0;
  let targetPort = 8081;
  let message = "";

  async function toggleListening() {
    try {
      if (isUdpListening) {
        message = await udpStore.stopListening();
      } else {
        message = await udpStore.startListening(port);
      }
    } catch (error) {
      message = error.message;
    }
  }

  async function sendNumber() {
    try {
      message = await udpStore.sendNumber(numberToSend, targetPort);
    } catch (error) {
      message = error.message;
    }
  }
</script>

<div class="udp-container">
  <h3>Real-time UDP Data</h3>

  <!-- Real-time Display -->
  <div class="realtime-display">
    {#if isUdpListening}
      <div class="listening-indicator">🟢 Listening on port {port}</div>
      {#if udpCurrentNumb !== null}
        <div class="current-value">
          <span class="label">Current:</span>
          <span class="number">{udpCurrentNumb}</span>
        </div>
      {:else}
        <div class="waiting">Waiting for data...</div>
      {/if}
    {:else}
      <div class="not-listening">⚫ Not listening</div>
    {/if}
  </div>

  <!-- Controls -->
  <div class="controls">
    <div class="control-group">
      <label>Listen Port:</label>
      <input
        type="number"
        bind:value={port}
        disabled={isUdpListening}
        min="1024"
        max="65535"
      />
      <button on:click={toggleListening}>
        {isUdpListening ? "Stop" : "Start"}
      </button>
    </div>

    <div class="control-group">
      <label>Send:</label>
      <input
        type="number"
        bind:value={numberToSend}
        placeholder="0-1000000"
        min="0"
        max="1000000"
      />
      <input
        type="number"
        bind:value={targetPort}
        placeholder="Port"
        min="1024"
        max="65535"
      />
      <button on:click={sendNumber}>Send</button>
    </div>
  </div>

  {#if message}
    <div class="status">{message}</div>
  {/if}
</div>

<style>
  .udp-container {
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    max-width: 500px;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .realtime-display {
    background: #f8f9fa;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 1.5rem;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .listening-indicator {
    font-weight: 600;
    color: #28a745;
    margin-bottom: 1rem;
  }

  .not-listening {
    font-weight: 600;
    color: #6c757d;
  }

  .current-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .label {
    font-size: 1.1rem;
    color: #495057;
  }

  .number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #007bff;
    font-family: "Courier New", monospace;
    background: #e3f2fd;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    min-width: 120px;
  }

  .waiting {
    color: #6c757d;
    font-style: italic;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .control-group label {
    font-weight: 600;
    min-width: 80px;
    color: #495057;
  }

  .control-group input {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .control-group button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .control-group button:hover {
    background: #0056b3;
  }

  .control-group button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .status {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #d1ecf1;
    border: 1px solid #bee5eb;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #0c5460;
  }
</style>
