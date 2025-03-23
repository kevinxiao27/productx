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
  let sentimentResults = [];
  let fullTranscript = null;
  let dangerLevel = 'no issue';
  let topDangerEvents = [];

  // First: try to analyze the audio for transcript + sentiment
  try {
    const result = await analyzeAudio(path);
    sentimentResults = result.sentimentResults;
    fullTranscript = result.fullTranscript;
    console.log('Sentiment Results:', sentimentResults);
  } catch (err) {
    console.error('Error during sentiment analysis:', err.message);
  }

  // Next: try to detect danger sounds
  try {
    topDangerEvents = await detectDangerSound(path);
  } catch (err) {
    console.error('Error during danger sound detection:', err.message);
  }

  // Now calculate the danger level — even if sentiment or sound failed
  for (const result of sentimentResults) {
    const cleanedText = cleanText(result.text);
    const sentiment = result.sentiment;
    const confidence = result.confidence;

    // 1. High confidence + danger sound => DANGER
    if (
      sentiment === 'NEGATIVE' &&
      confidence > 0.9 &&
      topDangerEvents.length > 0
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

    // 3. Medium confidence + severe OR sound => DANGER
    if (
      sentiment === 'NEGATIVE' &&
      confidence > 0.5 &&
      (severeRegex.test(cleanedText) || topDangerEvents.length > 0)
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
      break;
    }

    for (const event of topDangerEvents) {
      if (event.confidence > 0.3) {
        dangerLevel = 'medium'
        break;
      }
    }
  }

  return {
    transcript: fullTranscript,
    dangerLevel,
    topDangerEvents,
  };
}