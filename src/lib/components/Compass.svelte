<div class="panel-container">
  <div style="padding: 2px 6px; border-top: 1px solid lightgray; color: white;">
    Options
  </div>
  <div class="panel-content">
    <div>
      <div class="circle">
        <div
          class="rotating-circle"
          style="transform: rotate(45deg); transition: transform 0.2s;"
        >
          <div class="arrow">
            <span
              style="position: relative; top: -20px; right: 3px; text-align: center; font-size: 15pt; color: yellow;"
              >N</span
            >
          </div>
        </div>
      </div>
      <div class="cmps-value">cmps</div>
    </div>
    <div class="compass-correction">
      <div>Compass Correction</div>
      <input type="number" />
      <button>Set</button>
      <button>Save Config</button>
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
    display: grid;
    grid-template-columns: 2fr 3fr;
    background-color: #222222;
  }
  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: black;
    border: 1px solid white;
    width: 90px;
    height: 90px;
    margin: 12px auto 8px;
  }
  .rotating-circle {
    height: 52px;
    width: 52px;
    border-radius: 50%;
    background-color: transparent;
  }
  .arrow {
    width: 6px;
    height: 50%;
    background-color: white;
    margin: auto;
    border-radius: 4px;
  }
  .cmps-value {
    text-align: center;
    background-color: black;
    color: white;
    font-size: 13pt;
    padding: 4px 6px;
    width: 80px;
    margin: 2px auto;
    border-radius: 15px;
  }
  .compass-correction {
    display: flex;
    flex-direction: column;
    padding: 20px 6px 6px;
    align-items: center;
    gap: 8px;
    color: white;
  }
  .compass-correction > input {
    padding: 3px 8px;
    max-width: 100px;
  }
  .compass-correction > button {
    padding: 6px 16px;
  }
</style>
