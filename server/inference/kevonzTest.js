// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({
  apiKey: 'd8e56c20ce574e649af8a89694b8b49f',
});

const FILE_URL = 'https://assemblyaiusercontent.com/playground/5ty2u-NDfXN.wav';

// You can also transcribe a local file by passing in a file path
// const FILE_URL = "./path/to/file.mp3";

// Request parameters
const data = {
  audio: FILE_URL,
  speech_model: 'best',
  summarization: true,
  iab_categories: true,
  sentiment_analysis: true,
  language_detection: true,
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(data);
  console.log(transcript.text);
};

run();
