import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

// Force US locale for the entire app
if (typeof window !== "undefined") {
  // Set the document language to US English
  document.documentElement.lang = "en-US";

  // Override navigator language properties
  Object.defineProperty(navigator, "language", {
    get: function () {
      return "en-US";
    },
    configurable: true,
  });

  Object.defineProperty(navigator, "languages", {
    get: function () {
      return ["en-US"];
    },
    configurable: true,
  });
}

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
