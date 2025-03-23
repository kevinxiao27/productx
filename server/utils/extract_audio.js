import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractAudioFromVideo = (videoBuffer, outputWavPath, originalFilename = '') => {
  return new Promise((resolve, reject) => {
    if (!videoBuffer || videoBuffer.length === 0) {
      return reject(new Error("Video buffer is empty or undefined"));
    }

    // Determine input extension
    const ext = path.extname(originalFilename).toLowerCase();
    const isWav = ext === '.wav';
    const isWebm = ext === '.webm';
    const isMp4 = ext === '.mp4';

    // Default to .webm if we don't know
    const tempInputPath = path.join(
      path.dirname(outputWavPath),
      `input-${uuidv4()}${isWav ? '.wav' : isMp4 ? '.mp4' : '.webm'}`
    );

    try {
      fs.writeFileSync(tempInputPath, videoBuffer);
    } catch (e) {
      return reject(new Error("Failed to write video buffer: " + e.message));
    }

    // ✅ Skip FFmpeg if already WAV
    if (isWav) {
      try {
        fs.copyFileSync(tempInputPath, outputWavPath);
        fs.unlinkSync(tempInputPath);
        return resolve();
      } catch (e) {
        return reject(new Error("Failed to copy WAV file: " + e.message));
      }
    }

    // 🌀 Otherwise, use FFmpeg to extract and convert
    ffmpeg(tempInputPath)
      .on('start', (cmdLine) => {
        console.log('FFmpeg command:', cmdLine);
      })
      .on('stderr', (stderrLine) => {
        console.error('FFmpeg stderr:', stderrLine);
      })
      .noVideo()
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .save(outputWavPath)
      .on('end', () => {
        fs.unlinkSync(tempInputPath);
        resolve();
      })
      .on('error', (err) => {
        fs.unlinkSync(tempInputPath);
        reject(new Error('FFmpeg error: ' + err.message));
      });
  });
};