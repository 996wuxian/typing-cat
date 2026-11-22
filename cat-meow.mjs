const meowUrl = new URL('./assets/mj.mp3', import.meta.url);

export function createMeowPlayer(signal) {
  let context;
  let analyser;
  let levels;
  let clip;
  let loading;
  let playing;

  signal?.addEventListener('abort', () => {
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }, { once: true });

  return {
    unlock() {
      if (!window.AudioContext) return;
      if (!context) {
        context = new AudioContext();
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        levels = new Float32Array(analyser.fftSize);
        analyser.connect(context.destination);
      }
      if (context.state === 'suspended') void context.resume().catch(() => {});
      if (!clip && !loading) {
        loading = fetch(meowUrl, { signal }).then(response => {
          if (!response.ok) throw new Error(`Could not load mj.mp3 (${response.status})`);
          return response.arrayBuffer();
        }).then(bytes => context.decodeAudioData(bytes)).then(buffer => {
          clip = buffer;
        }).catch(error => {
          if (!signal?.aborted) console.error(error);
        }).finally(() => { loading = undefined; });
      }
    },

    play() {
      if (!clip || playing || context.state !== 'running') return 0;
      const source = context.createBufferSource();
      source.buffer = clip;
      source.connect(analyser);
      source.onended = () => {
        source.disconnect();
        playing = undefined;
      };
      playing = source;
      source.start();
      return clip.duration;
    },

    mouthAmount() {
      if (!playing) return 0;
      analyser.getFloatTimeDomainData(levels);
      let energy = 0;
      for (const level of levels) energy += level * level;
      const loudness = Math.max(0, Math.sqrt(energy / levels.length) - .008);
      return Math.min(1, Math.sqrt(loudness * 7));
    },
  };
}
