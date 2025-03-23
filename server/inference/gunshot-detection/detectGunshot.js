import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Returns [{ label: string, frames: number, confidence: number }]
export async function detectGunshot(filePath) {
  if (!filePath) {
    throw new Error('filePath is undefined or null.');
  }

  const scriptPath = resolve(__dirname, 'detect_gunshot.py');
  console.log('Running Python script at:', scriptPath);
  console.log('Passing audio file path:', filePath);

  return new Promise((resolve, reject) => {
    const process = spawn('python3', [scriptPath, filePath]);

    let stdoutData = '';
    let stderrData = '';

    process.stdout.on('data', (data) => {
      const str = data.toString();
      stdoutData += str;
      console.log('PYTHON stdout:', str);
    });

    process.stderr.on('data', (data) => {
      const str = data.toString();
      stderrData += str;
      console.error('PYTHON stderr:', str);
    });

    process.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);

      if (stderrData) {
        reject(new Error('Python stderr:\n' + stderrData));
        return;
      }

      const lines = stdoutData
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^[1-3]\./.test(line)); // lines starting with 1., 2., or 3.

      const parsed = lines
        .map((line) => {
          const match = line.match(
            /^\d+\.\s+\d+,[^,]+,(.+?)\s+—\s+(\d+)\s+frames, max confidence: ([\d.]+)/
          );
          if (!match) return null;

          const [_, label, frames, confidence] = match;
          return {
            label: label.replace(/(^"|"$)/g, ''), // remove surrounding quotes if any
            frames: parseInt(frames),
            confidence: parseFloat(confidence),
          };
        })
        .filter(Boolean);

      resolve(parsed); // Return full list
    });

    process.on('error', (err) => {
      console.error('Python spawn error:', err);
      reject(err);
    });
  });
}
