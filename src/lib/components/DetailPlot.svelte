<script>
  import { dfStore } from "../stores/dfStore.svelte.js";

  // Get polar data from dfStore
  let polarData = $derived(dfStore.data?.polar ? [...dfStore.data.polar] : []);

  // SVG dimensions
  const width = 260;
  const height = 260;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 100;

  // Convert polar data to SVG path
  function createRadarPath(data) {
    if (!data.length) return "";

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1; // Avoid division by zero

    let path = "";
    data.forEach((value, index) => {
      const angle =
        ((index * 360) / data.length) * (Math.PI / 180) - Math.PI / 2; // Start from top
      const normalizedValue = (value - minValue) / range; // Normalize to 0-1
      const r = normalizedValue * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    path += " Z"; // Close the path
    return path;
  }

  // Create grid circles
  function createGridCircles() {
    const circles = [];
    for (let i = 1; i <= 4; i++) {
      circles.push({
        r: (radius / 4) * i,
        opacity: 0.3,
      });
    }
    return circles;
  }

  let gridCircles = createGridCircles();
  let radarPath = $derived(createRadarPath(polarData));
</script>

<div class="chart-wrapper">
  {#if polarData.length > 0}
    <svg {width} {height} class="radar-svg">
      <!-- Grid circles -->
      {#each gridCircles as circle}
        <circle
          cx={centerX}
          cy={centerY}
          r={circle.r}
          fill="none"
          stroke="white"
          stroke-width="1"
          opacity={circle.opacity}
        />
      {/each}

      <!-- Radar data -->
      <path
        d={radarPath}
        fill="rgba(0, 50, 255, 0.3)"
        stroke="rgba(0, 50, 255, 1)"
        stroke-width="1"
      />
    </svg>
  {:else}
    <div class="no-data">
      <div>No DF Data</div>
      <div class="status">
        {#if dfStore.isLoading}
          Loading...
        {:else if dfStore.error}
          Error: {dfStore.error}
        {:else}
          Waiting for data...
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .chart-wrapper {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background-color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    pointer-events: none; /* Disable all mouse events on the container */
  }

  .radar-svg {
    background-color: transparent;
    pointer-events: none; /* Disable all mouse events on the SVG */
  }

  .no-data {
    color: white;
    text-align: center;
  }

  .no-data > div:first-child {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .status {
    font-size: 14px;
    opacity: 0.7;
  }
</style>
