import { LazyStore } from "@tauri-apps/plugin-store";

class ConfigStore {
  compassOffset = $state(0);
  gpsLocation = $state({ lat: 0, lng: 0 });

  #store = null;
  #isLoading = $state(false);
  #error = $state(null);

  get isLoading() {
    return this.#isLoading;
  }

  get error() {
    return this.#error;
  }

  get allSettings() {
    return {
      compassOffset: this.compassOffset,
      gpsLocation: this.gpsLocation,
    };
  }

  async #initStore() {
    if (!this.#store) {
      this.#store = new LazyStore("elangdf-config.json");
    }
    return this.#store;
  }

  async load() {
    this.#isLoading = true;
    this.#error = null;

    try {
      const store = await this.#initStore();

      const compassOffset = await store.get("compassOffset");
      const gpsLocation = await store.get("gpsLocation");

      this.compassOffset = compassOffset ?? 0;
      this.gpsLocation = gpsLocation ?? { lat: 0, lng: 0 };

      console.log("Settings loaded successfully:", this.allSettings);
      this.#isLoading = false;
      return { success: true, data: this.allSettings };
    } catch (error) {
      console.error("Failed to load settings:", error);
      this.#error = error.message;
      this.#isLoading = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  async #saveToStore(key, value) {
    try {
      const store = await this.#initStore();
      await store.set(key, value);
      await store.save();
      return { success: true };
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      this.#error = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * @param {number} value
   */
  async setCompassOffset(value) {
    const oldValue = this.compassOffset;
    this.compassOffset = Number(value);

    const result = await this.#saveToStore("compassOffset", this.compassOffset);
    if (!result.success) {
      this.compassOffset = oldValue;
      console.error("Failed to save compass offset, reverting to:", oldValue);
    } else {
      console.log("Compass offset saved:", this.compassOffset);
    }

    return result;
  }

  /**
   * @param {number} lat
   * @param {number} lng
   */
  async setGPSLocation(lat, lng) {
    const oldValue = { ...this.gpsLocation };
    this.gpsLocation = {
      lat: Number(lat),
      lng: Number(lng),
    };

    const result = await this.#saveToStore("gpsLocation", this.gpsLocation);
    if (!result.success) {
      this.gpsLocation = oldValue;
      console.error("Failed to save GPS location, reverting to:", oldValue);
    } else {
      console.log("GPS location saved:", this.gpsLocation);
    }
    return result;
  }

  async reset() {
    this.compassOffset = 0;
    this.gpsLocation = { lat: 0, lng: 0 };

    try {
      const store = await this.#initStore();
      await store.clear();
      await store.save();
      console.log("Settings reset to defaults");
      return { success: true };
    } catch (error) {
      console.error("Failed to reset settings:", error);
      this.#error = error.message;
      return { success: false, error: error.message };
    }
  }
}

export const configStore = new ConfigStore();
