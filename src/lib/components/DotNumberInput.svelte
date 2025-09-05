<script>
  /**
   * A numeric input that always uses dot as decimal separator,
   * regardless of user locale. Normalizes commas (`,`) to dots (`.`).
   */

  export let value = 0; // always a number
  export let disabled = false;
  export let readonly = false;
  export let placeholder = "";

  /**
   * @param {{ target: HTMLInputElement; }} e
   */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    let normalized = target.value.replace(",", "."); // replace commas
    normalized = normalized.replace(/[^0-9.\-]/g, ""); // filter out junk

    const num = parseFloat(normalized);
    value = isNaN(num) ? 0 : num; // keep it as number
  }

  function handleBlur() {
    if (!isNaN(value)) {
      // format to fixed decimals, then parse back to number
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
