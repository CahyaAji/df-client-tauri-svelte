import { readDF } from "../utils/apihandler.js";

class DFStore {
  data = $state(null);
  error = $state(null);
  isLoading = $state(false);

  #interval = null;

  // Add method to check if running
  get isRunning() {
    return this.#interval !== null;
  }

  async fetch() {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await readDF();

      if (result.success) {
        this.data = result.data;
      } else {
        this.error = result.error;
      }

      this.isLoading = false;
      return result;
    } catch (error) {
      this.error = error.message;
      this.isLoading = false;
      return { success: false, error: error.message };
    }
  }

  start() {
    if (this.#interval) {
      return;
    }

    this.fetch();
    this.#interval = setInterval(() => {
      this.fetch();
    }, 1000);

    console.log("DF Store started");
  }

  stop() {
    if (this.#interval) {
      clearInterval(this.#interval);
      this.#interval = null;
      console.log("DF monitoring stopped");
    }
  }

  clear() {
    this.data = null;
    this.error = null;
    this.isLoading = false;
  }
}

export const dfStore = new DFStore();
