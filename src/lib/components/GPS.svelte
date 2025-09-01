<script>
  import { readGPS } from "../utils/apihandler";
  import { configStore } from "../stores/Config.Store.svelte";
  import * as utm from "utm";

  // Local state for input fields
  let inputLat = $state(0);
  let inputLng = $state(0);
  let isReading = $state(false);

  // UTM fields - now editable
  let inputUtmZone = $state("");
  let inputUtmEasting = $state("");
  let inputUtmNorthing = $state("");
  let inputUtmCO = $state("");

  // Derived values from config store
  let storedLat = $derived(configStore.gpsLocation.lat);
  let storedLng = $derived(configStore.gpsLocation.lng);
  let storedUtmZone = $derived(configStore.utmLocation.zone);
  let storedUtmEasting = $derived(configStore.utmLocation.easting);
  let storedUtmNorthing = $derived(configStore.utmLocation.northing);
  let storedUtmCO = $derived(configStore.utmLocation.co);

  // Initialize inputs with stored values only on first load
  let initialized = $state(false);

  $effect(() => {
    if (!initialized) {
      inputLat = storedLat;
      inputLng = storedLng;
      inputUtmZone = storedUtmZone;
      inputUtmEasting = storedUtmEasting;
      inputUtmNorthing = storedUtmNorthing;
      inputUtmCO = storedUtmCO;
      initialized = true;
    }
  });

  // 1. Read GPS function with retry logic
  async function handleReadGPS() {
    if (isReading) return;

    isReading = true;
    console.log("Starting GPS reading with retry logic...");

    const MAX_RETRIES = 10;
    const RETRY_INTERVAL = 3000; // 3 seconds
    let attempt = 0;

    try {
      while (attempt < MAX_RETRIES) {
        attempt++;
        console.log(`GPS reading attempt ${attempt}/${MAX_RETRIES}`);

        const result = await readGPS();

        if (result.success && result.data) {
          // Debug: Log the full response structure
          console.log(
            `Attempt ${attempt} - Full GPS response:`,
            JSON.stringify(result.data, null, 2)
          );

          let gpsData = result.data;

          // Check if data is a JSON string and parse it
          if (typeof result.data === "string") {
            console.log("Data is string, parsing JSON...");
            gpsData = JSON.parse(result.data);
            console.log("Parsed GPS data:", gpsData);
          }

          // Now extract coordinates from the parsed data
          let lat = 0;
          let lng = 0;

          // If parsed data has nested structure
          if (gpsData.data) {
            lat = Number(gpsData.data.lat) || 0;
            lng = Number(gpsData.data.lng) || 0;
          } else {
            // Direct structure
            lat = Number(gpsData.lat) || 0;
            lng = Number(gpsData.lng) || 0;
          }

          console.log(`Attempt ${attempt} - Extracted coordinates:`, {
            lat,
            lng,
          });

          // Check if coordinates are valid (not 0.00)
          if (lat !== 0 && lng !== 0) {
            // Success! Update input fields
            inputLat = lat;
            inputLng = lng;
            console.log(`GPS reading successful on attempt ${attempt}!`);
            return; // Exit the function successfully
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

        // If this wasn't the last attempt, wait before retrying
        if (attempt < MAX_RETRIES) {
          console.log(
            `Waiting ${RETRY_INTERVAL / 1000} seconds before next attempt...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
        }
      }

      // If we get here, all attempts failed
      console.error(
        `Failed to get valid GPS coordinates after ${MAX_RETRIES} attempts`
      );
      alert(
        `Failed to get valid GPS coordinates after ${MAX_RETRIES} attempts. The GPS sensor may not be receiving a signal.`
      );
    } catch (error) {
      console.error("Error during GPS reading:", error);
      alert("Error reading GPS: " + error.message);
    } finally {
      isReading = false;
    }
  }

  // 3. Save GPS function - now saves both GPS and UTM
  async function handleSaveGPS() {
    if (configStore.isLoading) return;

    console.log("Saving GPS and UTM location:", {
      lat: inputLat,
      lng: inputLng,
      utm: {
        zone: inputUtmZone,
        easting: inputUtmEasting,
        northing: inputUtmNorthing,
        co: inputUtmCO,
      },
    });

    try {
      // Save GPS coordinates
      const gpsResult = await configStore.setGPSLocation(inputLat, inputLng);

      // Save UTM coordinates
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
        alert("Failed to save location: " + errors.join(", "));
      }
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error saving location: " + error.message);
    }
  }

  // Convert UTM function
  function handleConvertUTM() {
    try {
      // Check if we have valid lat/lng coordinates
      if (!inputLat || !inputLng || inputLat === 0 || inputLng === 0) {
        alert("Please enter valid latitude and longitude coordinates first");
        return;
      }

      // Validate coordinate ranges
      if (Math.abs(inputLat) > 90) {
        alert("Latitude must be between -90 and 90 degrees");
        return;
      }
      if (Math.abs(inputLng) > 180) {
        alert("Longitude must be between -180 and 180 degrees");
        return;
      }

      console.log("Converting coordinates to UTM:", {
        lat: inputLat,
        lng: inputLng,
      });

      // Convert lat/lng to UTM using the utm package
      const utmResult = utm.fromLatLon(inputLat, inputLng);

      console.log("UTM conversion result:", utmResult);

      // Update UTM fields with converted values
      inputUtmZone = `${utmResult.zoneNum}${utmResult.zoneLetter}`;
      inputUtmEasting = utmResult.easting.toFixed(2);
      inputUtmNorthing = utmResult.northing.toFixed(2);

      // Calculate CO (Grid Coordinates) like your React code
      const strCOE = Math.round(utmResult.easting).toString();
      const strCON = Math.round(utmResult.northing).toString();

      inputUtmCO = `${strCOE.substring(1, strCOE.length - 1)}, ${strCON.substring(2, strCON.length - 1)}`;

      console.log("UTM values updated:", {
        zone: inputUtmZone,
        easting: inputUtmEasting,
        northing: inputUtmNorthing,
        co: inputUtmCO,
      });
    } catch (error) {
      console.error("Error converting to UTM:", error);
      alert("Error converting coordinates to UTM: " + error.message);
    }
  }
</script>

<div class="panel-container">
  <div class="title">Antenna GPS</div>
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
    background-color: #222222;
    color: white;
    padding: 2px;
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
