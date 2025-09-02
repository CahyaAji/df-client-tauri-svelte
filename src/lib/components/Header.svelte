<script>
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { primaryMonitor } from "@tauri-apps/api/window";
  import { LogicalPosition } from "@tauri-apps/api/window";

  import refreshImg from "../../assets/icons8-refresh-60.png";
  import alignLeftImg from "../../assets/btn-align-left.png";
  import alignRightImg from "../../assets/btn-align-right.png";

  async function alignRight() {
    try {
      const currentWindow = getCurrentWindow();
      const monitor = await primaryMonitor();

      if (!monitor) {
        console.error("Could not get monitor info");
        return;
      }

      const scaleFactor = await currentWindow.scaleFactor();
      const actualScreenWidth = monitor.size.width / scaleFactor;

      // const screenWidth = monitor.size.width;
      const windowSize = await currentWindow.outerSize();

      const newX = actualScreenWidth - windowSize.width / scaleFactor;
      const newY = 0;
      // const newY = Math.floor((monitor.size.height - windowHeight) / 2); // Center vertically

      await currentWindow.setPosition(new LogicalPosition(newX, newY));
    } catch (error) {
      console.error("Failed to align window right:", error);
    }
  }

  async function alignLeft() {
    try {
      const currentWindow = getCurrentWindow();

      await currentWindow.setPosition(new LogicalPosition(0, 0));
    } catch (error) {
      console.error("Failed to align window left:", error);
    }
  }

  function refreshPage() {
    window.location.reload();
  }
</script>

<div
  style="display: flex; gap: 6px; align-items: center; justify-content: right; padding: 2px 8px; background-color: #222222; border-bottom: 2px solid gray;"
>
  <button
    style="background-image: url({refreshImg});"
    aria-label="Refresh Page"
    onclick={refreshPage}
  ></button>
  <button
    style="background-image: url({alignLeftImg});"
    aria-label="Align left"
    onclick={alignLeft}
  ></button>
  <button
    style="background-image: url({alignRightImg});"
    aria-label="Align right"
    onclick={alignRight}
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
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  button:hover {
    opacity: 0.8;
  }

  button:active {
    opacity: 0.6;
  }
</style>
