<div class="panel-container">
  <div class="title">Antenna GPS</div>
  <div class="input-panel">
    <div class="latlng-content">
      <div>
        <div>Latitude</div>
        <input type="text" />
      </div>
      <div>
        <div>Longitude</div>
        <input type="text" />
      </div>
    </div>
    <div class="utm-content">
      <div class="utm-field">
        <div>Zone :</div>
        <input type="text" />
      </div>
      <div class="utm-field">
        <div>Easting :</div>
        <input type="text" />
      </div>
      <div class="utm-field">
        <div>Northing :</div>
        <input type="text" />
      </div>
      <div class="utm-field">
        <div>CO :</div>
        <input type="text" />
      </div>
    </div>
  </div>
  <div class="button-panel">
    <button>Read GPS</button>
    <button>Convert UTM</button>
    <button>Save</button>
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
</style>
