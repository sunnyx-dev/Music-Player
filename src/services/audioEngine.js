// Audio Visualizer logic is disabled when using YouTube Iframe Player
// due to Cross-Origin Resource Sharing (CORS) restrictions on iframes.

export function getAudioContext() {
  return null;
}

export function connectAnalyser(audioElement) {
  return null;
}

export function getFrequencyData(analyser) {
  return new Uint8Array(256);
}

export function getWaveformData(analyser) {
  const data = new Uint8Array(256);
  data.fill(128); // flat line
  return data;
}

export function getAverageVolume(data) {
  return 0;
}
