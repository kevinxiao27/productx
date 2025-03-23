import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export const analyzeAudio = async (fileBuffer) => {
  try {
    
    console.log('🔍 Analyzing audio at path');
    
    // Upload audio file to AssemblyAI
    const uploadRes = await axios({
      method: 'post',
      url: 'https://api.assemblyai.com/v2/upload',
      headers: { authorization: process.env.ASSEMBLY_API_KEY },
      data: fileBuffer, // <--- Changed here
    });
    
    console.log('✅ File uploaded:', uploadRes.data);
    
    const audio_url = uploadRes.data.upload_url;
    
    // Request transcription with sentiment analysis
    const transcriptRes = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      {
        audio_url,
        sentiment_analysis: true,
      },
      {
        headers: {
          authorization: process.env.ASSEMBLY_API_KEY,
        },
      }
    );
    
    const transcriptId = transcriptRes.data.id;
    
    // Polling until transcription is ready
    let status = 'processing';
    while (status !== 'completed') {
      const res = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: process.env.ASSEMBLY_API_KEY },
        }
      );
      
      status = res.data.status;
      
      if (status === 'completed') {
        const sentimentResults = res.data.sentiment_analysis_results;
        
        return {
          sentimentResults,
          fullTranscript: res.data.text,
        };
      }
      
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error(error);
  }
};
