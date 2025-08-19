// src/lib/stores/udpStore.js
import { writable } from "svelte/store";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const udpCurrentNumb = writable(null);
export const udpCurrentMsg = writable(null);
export const isUdpListening = writable(false);

let unlisten = null;

export const udpStore = {
  startListening: async (port = 8080) => {
    try {
      await invoke("start_udp_listener", { port });

      unlisten = await listen("udp-message", (event) => {
        const message = event.payload;

        // Just update current values - no saving/history
        udpCurrentMsg.set(message);

        if (message.type === "number") {
          udpCurrentNumb.set(message.data.value);
        }
      });

      isUdpListening.set(true);
      return `Listening on port ${port}`;
    } catch (error) {
      throw new Error(`Failed to start: ${error}`);
    }
  },

  stopListening: async () => {
    try {
      if (unlisten) {
        unlisten();
        unlisten = null;
      }
      await invoke("stop_udp_listener");
      isUdpListening.set(false);

      // Clear current values when stopping
      udpCurrentNumb.set(null);
      udpCurrentMsg.set(null);

      return "Stopped listening";
    } catch (error) {
      throw new Error(`Failed to stop: ${error}`);
    }
  },

  sendNumber: async (number, port = 8080) => {
    if (number < 0 || number > 1000000) {
      throw new Error("Number must be between 0-1000000");
    }

    try {
      await invoke("send_udp_number", { number, port });
      return `Sent ${number}`;
    } catch (error) {
      throw new Error(`Failed to send: ${error}`);
    }
  },
};
