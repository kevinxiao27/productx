const analyzeAudio = require('./classifier');

(async () => {
  try {
    const result = await analyzeAudio('./temp_audio/test.wav'); // <-- 👈 replace with your actual file path
    console.log('🎯 Full Transcript Result:', result);
  } catch (err) {
    console.error('❌ Error running analysis:', err.message);
  }
})();
