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

export async function analyzeDangerFromFile(path) {
  //   console.log(`Analyzing danger from file: ${fileName}`);
  try {
    let topDangerEvents = [];
    const { sentimentResults, fullTranscript } = await analyzeAudio(path);
    console.log('Sentiment Results:', sentimentResults);
    //   @TODO: change from buffer to filepath
    const dangerSoundResults = await detectDangerSound(path);
    // const dangerSoundResults = [];
    topDangerEvents = dangerSoundResults;

    let dangerLevel = 'no issue';

    // Loop through sentiment results
    for (const result of sentimentResults) {
      const cleanedText = cleanText(result.text);
      const sentiment = result.sentiment;
      // sentiment confidence
      const confidence = result.confidence;

      if (
        sentiment === 'NEGATIVE' &&
        confidence > 0.9 &&
        dangerSoundResults.length > 0
      ) {
        dangerLevel = 'danger';
        break;
      }

      // 2. Medium-high confidence + severe keyword => DANGER
      if (
        sentiment === 'NEGATIVE' &&
        confidence > 0.8 &&
        severeRegex.test(cleanedText)
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

      // 4. Medium-high confidence + mild keyword => MEDIUM
      if (
        sentiment === 'NEGATIVE' &&
        confidence > 0.8 &&
        mildRegex.test(cleanedText)
      ) {
        dangerLevel = 'medium';
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
