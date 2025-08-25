class SignalState {
  currentFreq = $state(0);
  currentGain = $state(0);
  autoMode = $state(true);

  /**
   * @param {number} freq
   */
  setFrequency(freq) {
    this.currentFreq = freq;
  }

  /**
   * @param {number} gain
   */
  setGain(gain) {
    this.currentGain = gain;
  }

  /**
   * @param {boolean} auto
   */
  setAutoMode(auto) {
    this.autoMode = auto;
    console.log("Auto mode changed to:", auto);
  }

  reset() {
    this.currentFreq = 0;
    this.currentGain = 0;
    this.autoMode = true;
  }
}

export const signalState = new SignalState();
