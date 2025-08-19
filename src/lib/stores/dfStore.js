// src/lib/stores/dfStore.js
import { writable } from "svelte/store";
import { readDF } from "../utils/apihandler.js";

export const dfData = writable(null);
export const dfError = writable(null);
export const isLoading = writable(false);

let interval = null;

export const dfStore = {
  async fetch() {
    isLoading.set(true);
    dfError.set(null);

    try {
      const result = await readDF();

      if (result.success) {
        dfData.set(result.data);
      } else {
        dfError.set(result.error);
      }

      isLoading.set(false);
      return result;
    } catch (error) {
      dfError.set(error.message);
      isLoading.set(false);
      return { success: false, error: error.message };
    }
  },

  start() {
    this.stop();
    this.fetch();

    interval = setInterval(() => {
      this.fetch();
    }, 1000);

    console.log("DF Store started");
  },

  stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
      console.log("DF monitoring stopped");
    }
  },

  clear() {
    dfData.set(null);
    dfError.set(null);
    isLoading.set(false);
  },
};
