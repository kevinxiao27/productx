import { analyzeDangerFromFile } from './sentiment.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Dynamically resolve the absolute path to the test.wav file
const audioPath = resolve(__dirname, '../temp_audio/test.wav');

(async () => {
  try {
    const result = await analyzeDangerFromFile(audioPath);
    console.log('Full Transcript Result:', result);
  } catch (err) {
    console.error('Error running analysis:', err.message);
  }
})();
