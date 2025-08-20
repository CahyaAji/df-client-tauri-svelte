// src/lib/stores/udpStore.js
import { writable, get } from "svelte/store";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const udpCurrentNumb = writable(null);
export const udpCurrentMsg = writable(null);
export const isUdpListening = writable(false);

let unlisten = null;
let listening = false; // internal guard

export const udpStore = {
  startListening: async (port = 8080) => {
    if (listening || get(isUdpListening)) {
      return `Already listening on port ${port}`;
    }

    try {
      const result = await invoke("start_udp_listener", { port });

      if (typeof result === "string" && result.includes("Already listening")) {
        listening = true;
        isUdpListening.set(true);
        return result; // reuse backend message
      }

      unlisten = await listen("udp-message", (event) => {
        const message = event.payload;
        udpCurrentMsg.set(message);
        if (message.type === "number") {
          udpCurrentNumb.set(message.data.value);
        }
      });

      listening = true;
      isUdpListening.set(true);
      return `Listening on port ${port}`;
    } catch (error) {
      if (String(error).includes("Already listening")) {
        listening = true;
        isUdpListening.set(true);
        return `Already listening on port ${port}`;
      }

      listening = false;
      isUdpListening.set(false);
      throw new Error(`Failed to start: ${error}`);
    }
  },

  stopListening: async () => {
    if (!listening && !get(isUdpListening)) {
      return "Not listening";
    }

    try {
      if (unlisten) {
        unlisten();
        unlisten = null;
      }
      await invoke("stop_udp_listener");
      listening = false;
      isUdpListening.set(false);

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
