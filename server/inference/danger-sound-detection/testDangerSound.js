import { detectDangerSound } from './detectDangerSound.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = resolve(__dirname, '../../temp_audio/test.wav');

(async () => {
  const result = await detectDangerSound(filePath);
  if (result.length === 0) {
    console.log('No danger sounds detected.');
  } else {
    console.log('Top danger sounds:');
    result.forEach(({ label, frames, confidence }, i) => {
      console.log(
        `${
          i + 1
        }. ${label} — ${frames} frames, confidence: ${confidence.toFixed(3)}`
      );
    });
  }
})();
