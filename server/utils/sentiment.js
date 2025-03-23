import { analyzeAudio } from '../inference/sentiment-analysis/analyzeAudio.js';
import { detectDangerSound } from '../inference/danger-sound-detection/detectDangerSound.js';
import { mildKeywords } from '../inference/sentiment-analysis/mildKeywords.js';
import { severeKeywords } from '../inference/sentiment-analysis/severeKeywords.js';

const mildRegex = new RegExp(mildKeywords.join('|'), 'i');
const severeRegex = new RegExp(severeKeywords.join('|'), 'i');

function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function analyzeDangerFromFile(filePath) {
  console.log('Analyzing danger from file:', filePath);
  try {
    let topDangerEvents = [];
    const { sentimentResults, fullTranscript } = await analyzeAudio(filePath);
    console.log('Sentiment Results:', sentimentResults);
    const dangerSoundResults = await detectDangerSound(filePath);
    topDangerEvents = dangerSoundResults;

    let dangerLevel = 'no issue';

    // Loop through sentiment results
    for (const result of sentimentResults) {
      const cleanedText = cleanText(result.text);
      const sentiment = result.sentiment;
      // sentiment confidence
      const confidence = result.confidence;

      // 1. Very high confidence = danger
      if (sentiment === 'NEGATIVE' && confidence > 0.9) {
        dangerLevel = 'danger';
        break;
      }

      // 2. Medium-high confidence + any keyword = danger
      if (
        sentiment === 'NEGATIVE' &&
        confidence > 0.8 &&
        (mildRegex.test(cleanedText) || severeRegex.test(cleanedText))
      ) {
        dangerLevel = 'danger';
        break;
      }

      // 3. Low-medium confidence + severe = danger
      if (
        sentiment === 'NEGATIVE' &&
        confidence > 0.5 &&
        (severeRegex.test(cleanedText) || dangerSoundResults.length > 0)
      ) {
        dangerLevel = 'danger';
        break;
      }

      // 4. Neutral + severe keyword = danger
      if (
        sentiment === 'NEUTRAL' &&
        confidence > 0.3 &&
        confidence < 0.5 &&
        (severeRegex.test(cleanedText) || dangerSoundResults.length > 0)
      ) {
        dangerLevel = 'danger';
        break;
      }
    }

    return {
      transcript: fullTranscript,
      dangerLevel: dangerLevel,
      topDangerEvents,
    };
  } catch (err) {
    console.error('Audio detection error:', err.message);
    return {};
  }
}
