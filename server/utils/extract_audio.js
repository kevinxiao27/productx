import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractAudioFromVideo = (videoBuffer, outputWavPath) => {
  return new Promise((resolve, reject) => {
    const tempInputPath = path.join(
      path.dirname(outputWavPath),
      `input-${Date.now()}.mp4`
    );
    fs.writeFileSync(tempInputPath, videoBuffer);

    ffmpeg(tempInputPath)
      .noVideo()
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .save(outputWavPath)
      .on('end', () => {
        fs.unlinkSync(tempInputPath); // Clean up temp video file
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};
