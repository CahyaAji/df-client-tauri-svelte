class SignalState {
  currentFreq = $state(0);
  currentGain = $state(0);

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

  reset() {
    this.currentFreq = 0;
    this.currentGain = 0;
  }
}

export const signalState = new SignalState();
