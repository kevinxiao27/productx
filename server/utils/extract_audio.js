import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractAudioFromVideo = (videoBuffer, outputWavPath) => {
  return new Promise((resolve, reject) => {
    const inputExt = path.extname(outputWavPath).toLowerCase();
    const isWav = inputExt === '.wav';

    const tempInputPath = path.join(
      path.dirname(outputWavPath),
      `input-${Date.now()}${isWav ? '.wav' : '.mp4'}`
    );

    try {
      if (!videoBuffer || videoBuffer.length === 0) {
        return reject(new Error("Video buffer is empty or undefined"));
      }

      fs.writeFileSync(tempInputPath, videoBuffer);
    } catch (e) {
      return reject(new Error("Failed to write video buffer: " + e.message));
    }

    // 🧠 Skip FFmpeg if input is already WAV — assume it's usable
    if (isWav) {
      try {
        fs.copyFileSync(tempInputPath, outputWavPath);
        fs.unlinkSync(tempInputPath);
        return resolve();
      } catch (e) {
        return reject(new Error("Failed to copy WAV file directly: " + e.message));
      }
    }

    // 🌀 Otherwise, extract audio from video
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
        fs.unlinkSync(tempInputPath); // Clean up
        resolve();
      })
      .on('error', (err) => {
        console.error("FFmpeg error:", err);
        fs.unlinkSync(tempInputPath);
        reject(err);
      });
  });
};