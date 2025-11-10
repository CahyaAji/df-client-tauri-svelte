<script>
  import { onMount } from "svelte";
  import { readGPS } from "../utils/apihandler";
  import { configStore } from "../stores/Config.Store.svelte";
  import * as utm from "utm";

  let inputLat = $state(0);
  let inputLng = $state(0);
  let isReading = $state(false);

  let inputUtmZone = $state("");
  let inputUtmEasting = $state("");
  let inputUtmNorthing = $state("");
  let inputUtmCO = $state("");

  // Initialize once when component mounts
  onMount(() => {
    inputLat = configStore.gpsLocation.lat;
    inputLng = configStore.gpsLocation.lng;
    inputUtmZone = configStore.utmLocation.zone;
    inputUtmEasting = configStore.utmLocation.easting;
    inputUtmNorthing = configStore.utmLocation.northing;
    inputUtmCO = configStore.utmLocation.co;
  });

  // 1. Read GPS function with retry logic
  async function handleReadGPS() {
    if (isReading) return;

    isReading = true;

    const MAX_RETRIES = 10;
    const RETRY_INTERVAL = 3000;
    let attempt = 0;

    try {
      while (attempt < MAX_RETRIES) {
        attempt++;

        const result = await readGPS();

        if (result.success && result.data) {
          let gpsData = result.data;
          if (typeof result.data === "string") {
            gpsData = JSON.parse(result.data);
            console.log("Parsed GPS data:", gpsData);
          }

          let lat = 0;
          let lng = 0;

          if (gpsData.data) {
            lat = Number(gpsData.data.lat) || 0;
            lng = Number(gpsData.data.lng) || 0;
          } else {
            lat = Number(gpsData.lat) || 0;
            lng = Number(gpsData.lng) || 0;
          }

          console.log(`GPS read Attempt ${attempt} - Extracted coordinates:`, {
            lat,
            lng,
          });

          if (lat !== 0 && lng !== 0) {
            inputLat = lat;
            inputLng = lng;
            return;
          } else {
            console.log(
              `Attempt ${attempt} - Got zero coordinates, retrying...`
            );
          }
        } else {
          console.error(
            `Attempt ${attempt} - Failed to read GPS:`,
            result.error
          );
        }

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
        }
      }

      console.error(
        `Failed to get valid GPS coordinates after ${MAX_RETRIES} attempts`
      );
    } catch (error) {
      console.error("Error during GPS reading:", error);
    } finally {
      isReading = false;
    }
  }

  async function handleSaveGPS() {
    if (configStore.isLoading) return;

    try {
      const gpsResult = await configStore.setGPSLocation(inputLat, inputLng);

      const utmResult = await configStore.setUTMLocation(
        inputUtmZone,
        inputUtmEasting,
        inputUtmNorthing,
        inputUtmCO
      );

      if (gpsResult.success && utmResult.success) {
        console.log("GPS and UTM location saved successfully");
      } else {
        const errors = [];
        if (!gpsResult.success) errors.push("GPS: " + gpsResult.error);
        if (!utmResult.success) errors.push("UTM: " + utmResult.error);

        console.error("Failed to save location:", errors.join(", "));
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
  }

  function handleConvertUTM() {
    try {
      if (!inputLat || !inputLng || inputLat === 0 || inputLng === 0) {
        alert("Please enter valid latitude and longitude coordinates first");
        return;
      }

      if (Math.abs(inputLat) > 90) {
        alert("Latitude must be between -90 and 90 degrees");
        return;
      }
      if (Math.abs(inputLng) > 180) {
        alert("Longitude must be between -180 and 180 degrees");
        return;
      }

      const utmResult = utm.fromLatLon(inputLat, inputLng);

      inputUtmZone = `${utmResult.zoneNum}${utmResult.zoneLetter}`;
      inputUtmEasting = utmResult.easting.toFixed(2);
      inputUtmNorthing = utmResult.northing.toFixed(2);

      const strCOE = Math.round(utmResult.easting).toString();
      const strCON = Math.round(utmResult.northing).toString();

      inputUtmCO = `${strCOE.substring(1, strCOE.length - 1)}, ${strCON.substring(2, strCON.length - 1)}`;
    } catch (error) {
      console.error("Error converting to UTM:", error);
    }
  }
</script>

<div class="panel-container">
  <div class="title">GPS</div>
  <div class="input-panel">
    <div class="latlng-content">
      <div>
        <div>Latitude</div>
        <input
          type="number"
          step="0.000001"
          bind:value={inputLat}
          lang="en-US"
          disabled={isReading || configStore.isLoading}
        />
      </div>
      <div>
        <div>Longitude</div>
        <input
          type="number"
          step="0.000001"
          bind:value={inputLng}
          lang="en-US"
          disabled={isReading || configStore.isLoading}
        />
      </div>
    </div>
    <div class="utm-content">
      <div class="utm-field">
        <div>Zone :</div>
        <input
          type="text"
          bind:value={inputUtmZone}
          lang="en-US"
          disabled={isReading || configStore.isLoading}
        />
      </div>
      <div class="utm-field">
        <div>Easting :</div>
        <input
          type="text"
          bind:value={inputUtmEasting}
          lang="en-US"
          disabled={isReading || configStore.isLoading}
        />
      </div>
      <div class="utm-field">
        <div>Northing :</div>
        <input
          type="text"
          bind:value={inputUtmNorthing}
          lang="en-US"
          disabled={isReading || configStore.isLoading}
        />
      </div>
      <div class="utm-field">
        <div>CO :</div>
        <input
          type="text"
          bind:value={inputUtmCO}
          disabled={isReading || configStore.isLoading}
        />
      </div>
    </div>
  </div>
  <div class="button-panel">
    <button
      onclick={handleReadGPS}
      disabled={isReading || configStore.isLoading}
    >
      {isReading ? "Reading..." : "Read GPS"}
    </button>
    <button onclick={handleConvertUTM}>Convert UTM</button>
    <button
      onclick={handleSaveGPS}
      disabled={isReading || configStore.isLoading}
    >
      {configStore.isLoading ? "Saving..." : "Save"}
    </button>
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
    color: white;
    padding: 8px 8px 4px;
  }
  .input-panel {
    flex: 1;
    display: grid;
    grid-template-columns: 2fr 3fr;
  }
  .latlng-content {
    background-color: #222222;
    color: white;
    padding-top: 2px;
    padding-left: 16px;
    align-content: center;
    border-right: 1px solid darkgray;
  }

  .latlng-content input {
    margin: 3px 0;
    padding: 2px 8px;
    max-width: 130px;
  }

  .latlng-content input:disabled {
    background-color: #333;
    color: #888;
  }

  .utm-content {
    display: flex;
    flex-direction: column;
    background-color: #222222;
    color: white;
    padding: 2px;
    justify-content: center;
    align-items: center;
  }
  .utm-field {
    display: flex;
    padding: 2px 4px;
    align-items: center;
  }
  .utm-field > div {
    min-width: 70px;
    align-self: flex-end;
  }
  .utm-field > input {
    max-width: 100px;
    margin: 0px 6px;
    padding: 2px 4px;
  }
  .button-panel {
    display: flex;
    background-color: #141414;
  }
  .button-panel > button {
    padding: 4px 8px;
    margin: 2px auto;
    min-width: 90px;
  }

  .button-panel > button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>