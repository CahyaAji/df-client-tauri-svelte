// src/lib/stores/udpStore.svelte.js
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Class-based approach to avoid export reassignment issues
class UdpState {
  currentNumb = $state(0);
  currentMsg = $state(null);
  isListening = $state(false);
}

export const udpState = new UdpState();

let unlisten = null;
let listening = false; // internal guard

export const udpStore = {
  startListening: async (port = 8080) => {
    if (listening || udpState.isListening) {
      // Use class property
      return `Already listening on port ${port}`;
    }

    try {
      const result = await invoke("start_udp_listener", { port });

      if (typeof result === "string" && result.includes("Already listening")) {
        listening = true;
        udpState.isListening = true; // Update class property
        return result; // reuse backend message
      }

      unlisten = await listen("udp-message", (event) => {
        const message = event.payload;
        udpState.currentMsg = message; // Update class property
        if (message.type === "number") {
          udpState.currentNumb = message.data.value; // Update class property
        }
      });

      listening = true;
      udpState.isListening = true; // Update class property
      return `Listening on port ${port}`;
    } catch (error) {
      if (String(error).includes("Already listening")) {
        listening = true;
        udpState.isListening = true; // Update class property
        return `Already listening on port ${port}`;
      }

      listening = false;
      udpState.isListening = false; // Update class property
      throw new Error(`Failed to start: ${error}`);
    }
  },

  stopListening: async () => {
    if (!listening && !udpState.isListening) {
      // Use class property
      return "Not listening";
    }

    try {
      if (unlisten) {
        unlisten();
        unlisten = null;
      }
      await invoke("stop_udp_listener");
      listening = false;
      udpState.isListening = false; // Update class property

      udpState.currentNumb = null; // Update class property
      udpState.currentMsg = null; // Update class property

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
