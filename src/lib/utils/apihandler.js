import { fetch } from "@tauri-apps/plugin-http";

// export const API_URL = "http://192.168.17.17:8087";
export const API_URL = "http://localhost:3000";

export const readDF = async () => {
  try {
    const response = await fetch(`${API_URL}/df`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const resText = await response.text();
    if (!resText || resText.trim() === "") {
      throw new Error("DF data is empty");
    }

    const dataArray = resText.split(",").map((v) => v.trim());

    if (dataArray.length < 377) {
      throw new Error("DF data is incomplete");
    }

    const data = {
      time: dataArray[0].trim(),
      heading: (360 - Number(dataArray[1].trim())) % 360,
      confidence: dataArray[2].trim(),
      power: dataArray[3].trim(),
      polar: dataArray.slice(17, 377).map(Number).reverse(),
    };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const setFreqGainApi = async (
  /** @type {{center_freq: number, uniform_gain: number, ant_spacing_meters: number}} */ data
) => {
  try {
    const response = await fetch(API_URL + "/api/settings/freq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      const jsonResponse = await response.json();
      console.log("setFreqGainApi success: ", jsonResponse);
    }
  } catch (error) {
    console.error("Error setFreqGainApi: ", error);
  }
};

export const turnOffDf = async () => {
  try {
    const response = await fetch(API_URL + "/api/shutdown");
  } catch (error) {
    console.error("Error TurnOffDF: ", error);
  } finally {
    setTimeout(() => {
      console.log("turning off DF App");
    }, 2000);
  }
};

export const restartDf = async () => {
  try {
  } catch (error) {
    console.error("Error RestartDF: ", error);
  } finally {
    setTimeout(() => {
      console.log("restarting DF App");
    }, 2000);
  }
};
