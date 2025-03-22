import axios from 'axios';
import fs from 'fs';
import { mapSentimentToDanger } from './mapSentiment';
require('dotenv').config();

export const analyzeAudio = async (filePath) => {
  const uploadRes = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/upload',
    headers: { authorization: process.env.ASSEMBLY_API_KEY },
    data: fs.createReadStream(filePath),
  });

  const audio_url = uploadRes.data.upload_url;

  const transcriptRes = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    {
      audio_url: audio_url,
      sentiment_analysis: true,
    },
    {
      headers: {
        authorization: process.env.ASSEMBLY_API_KEY,
      },
    }
  );

  const transcriptId = transcriptRes.data.id;

  let status = 'processing';
  while (status !== 'completed') {
    const res = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      { headers: { authorization: process.env.ASSEMBLY_API_KEY } }
    );

    status = res.data.status;

    if (status === 'completed') {
      const sentimentResults = res.data.sentiment_analysis_results;
      const dangerLevel = mapSentimentToDanger(sentimentResults);

      return {
        sentimentResults,
        dangerLevel,
        fullTranscript: res.data.text,
      };
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
};
