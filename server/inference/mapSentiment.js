import { mildKeywords } from './mildKeywords';
import { severeKeywords } from './severeKeywords';

const mildRegex = new RegExp(mildKeywords.join('|'), 'i');
const severeRegex = new RegExp(severeKeywords.join('|'), 'i');

function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]|_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const mapSentimentToDanger = (sentimentResults) => {
  let dangerLevel = 'no issue';

  for (const result of sentimentResults) {
    const cleanedText = cleanText(result.text);
    const sentiment = result.sentiment;
    // sentiment confidence
    const confidence = result.confidence;

    // 1. Very high confidence = danger
    if (sentiment === 'NEGATIVE' && confidence > 0.9) {
      return 'danger';
    }

    // 2. Medium-high confidence + any keyword = danger
    if (
      sentiment === 'NEGATIVE' &&
      confidence > 0.8 &&
      (mildRegex.test(cleanedText) || severeRegex.test(cleanedText))
    ) {
      return 'danger';
    }

    // 3. Low-medium confidence + severe = danger
    if (
      sentiment === 'NEGATIVE' &&
      confidence > 0.5 &&
      severeRegex.test(cleanedText)
    ) {
      return 'danger';
    }

    // 4. Neutral + severe keyword = danger
    if (
      sentiment === 'NEUTRAL' &&
      confidence > 0.3 &&
      confidence < 0.5 &&
      severeRegex.test(cleanedText)
    ) {
      return 'danger';
    }

    // 5. Medium concern
    if (sentiment === 'NEGATIVE' && confidence > 0.7) {
      dangerLevel = 'medium';
    }
  }

  return dangerLevel;
};
