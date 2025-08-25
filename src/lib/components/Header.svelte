<script>
  import refreshImg from "../../assets/icons8-refresh-60.png";
  import alignLeftImg from "../../assets/btn-align-left.png";
  import alignRightImg from "../../assets/btn-align-right.png";
</script>

<div
  style="display: flex; gap: 6px; align-items: center; justify-content: right; padding: 2px 8px; background-color: #222222; border-bottom: 2px solid gray;"
>
  <button style="background-image: url({refreshImg});" aria-label="Refresh"
  ></button>
  <button style="background-image: url({alignLeftImg});" aria-label="Align left"
  ></button>
  <button
    style="background-image: url({alignRightImg});"
    aria-label="Align right"
  ></button>
</div>

<style>
  button {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    justify-content: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
</style>
