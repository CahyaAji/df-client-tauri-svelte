<script>
  export let value = 0;
  export let disabled = false;
  export let readonly = false;
  export let placeholder = "";

  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    let normalized = target.value.replace(",", ".");
    normalized = normalized.replace(/[^0-9.\-]/g, "");

    const num = parseFloat(normalized);
    value = isNaN(num) ? 0 : num;
  }

  function handleBlur() {
    if (!isNaN(value)) {
      value = Number(value.toFixed(3));
    }
  }
</script>

<input
  class="input-freq"
  type="text"
  inputmode="decimal"
  {disabled}
  {readonly}
  {placeholder}
  value={isNaN(value) ? "" : value.toString()}
  oninput={handleInput}
  onblur={handleBlur}
/>

<style>
  .input-freq {
    padding: 4px 8px;
    width: 110px;
  }
  .input-freq:disabled {
    background-color: #333;
    color: #888;
  }
</style>
