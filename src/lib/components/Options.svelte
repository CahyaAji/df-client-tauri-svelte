<script>
  let errorMessage = $state("");
</script>

<div class="panel-container">
  {#if errorMessage === ""}
    <div>No errors</div>
  {:else}
    <div>Error: {errorMessage}</div>
  {/if}
</div>

<style>
  .panel-container {
    display: flex;
    flex-direction: column;
    background-color: blueviolet;
  }
</style>
