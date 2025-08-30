<div class="panel-container">
  <div class="title">Antenna GPS</div>
  <div class="input-panel">isi</div>
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
    background-color: red;
  }
  .button-panel {
    display: flex;
    background-color: #141414;
  }
  .button-panel > button {
    padding: 4px 8px;
    margin: 4px auto;
    min-width: 90px;
  }
</style>
